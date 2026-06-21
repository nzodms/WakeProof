# WakeProof — Architecture

> Le réveil qui te force à te lever — et tes potes peuvent t'aider si tu fais le mort.

## 1. Vue d'ensemble

WakeProof est un réveil social à missions. Une alarme ne peut pas être désactivée
tant que l'utilisateur n'a pas accompli une mission vérifiable. Autour de l'alarme,
une couche sociale (Crews, Wake Blasts, classements, ligues) crée la motivation et
la viralité.

Stack :

| Couche            | Techno                                         |
| ----------------- | ---------------------------------------------- |
| App               | React Native + Expo (SDK 51), TypeScript strict |
| Navigation        | React Navigation (native-stack + bottom-tabs custom) |
| State             | Zustand (stores légers, sélecteurs)            |
| Backend           | Supabase (Auth, Postgres, Storage, Realtime)   |
| Animations        | Reanimated 3 + Gesture Handler                 |
| Verre / blur      | expo-blur, expo-linear-gradient                |
| Capteurs          | expo-sensors (accéléromètre, podomètre)        |
| Caméra / preuves  | expo-camera + Supabase Storage                 |
| Audio             | expo-av (sonneries, Wake Blasts vocaux)        |
| Notifications     | expo-notifications (alarmes locales)           |
| Premium           | RevenueCat (architecture prête, abstraite)     |

## 2. Structure des dossiers

```
WakeProof/
├── App.tsx                      # Entrée : providers + navigation
├── app.json                     # Config Expo (permissions, plugins)
├── supabase/
│   └── schema.sql               # Schéma complet + RLS + triggers
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   └── TECH_LIMITS.md           # Limites réelles iOS/Android pour l'alarme
└── src/
    ├── theme/                   # Design system (couleurs, typo, espacements)
    ├── components/
    │   ├── glass/               # Primitives Liquid Glass réutilisables
    │   ├── ui/                  # Boutons, Text, Screen, Avatar, Badge...
    │   └── navigation/          # LiquidGlassTabBar (pill flottante)
    ├── navigation/              # RootNavigator, TabNavigator, types
    ├── screens/                 # Un dossier par domaine
    │   ├── onboarding/
    │   ├── alarm/               # Home, CreateAlarm, ActiveAlarm
    │   ├── missions/            # MissionSetup, MissionExecution, Missions
    │   ├── crew/                # Crew, CrewDetail, WakeBlast
    │   ├── leaderboard/         # Leaderboard, GlobalLeaderboard
    │   ├── challenges/
    │   ├── profile/             # Profile, Settings, PrivacySettings
    │   └── paywall/
    ├── features/                # Logique métier pure (testable, sans UI)
    │   ├── missions/            # MissionEngine + missions individuelles
    │   ├── wakeScore/           # Calcul du Wake Score
    │   ├── wakeBlast/           # Règles d'autorisation des Wake Blasts
    │   ├── crew/                # Souscriptions Realtime
    │   └── leagues/             # Ligues, montée/descente
    ├── store/                   # Zustand stores
    ├── lib/                     # supabase, haptics, notifications, audio
    ├── types/                   # Types DB + domaine
    └── constants/               # Catégories, ligues, copy
```

## 3. Principe de séparation

- `features/*` ne contient **aucune dépendance UI**. Pur TypeScript, testable.
  Le `MissionEngine` et le `WakeScore` peuvent tourner côté app **et** côté
  Edge Functions Supabase pour valider les scores serveur (anti-triche).
- `screens/*` consomme les stores et appelle `features/*` + `lib/*`.
- `components/*` ne connaît pas le métier : props uniquement.

## 4. MissionEngine

Le `MissionEngine` est un registre extensible de missions. Chaque mission
implémente une interface commune :

```ts
interface Mission<Config, Progress> {
  type: MissionType;
  meta: MissionMeta;                       // titre, icône, premium, difficulté
  createInitialProgress(config): Progress; // état de départ
  evaluate(progress, config): MissionEvaluation; // { status, completionRatio }
  // Les missions à capteurs exposent un hook React dédié (useShakeMission...).
}
```

Flux d'exécution :

1. `ActiveAlarmScreen` lit la mission liée à l'alarme.
2. `MissionExecutionScreen` instancie le runner de la mission.
3. Le runner met à jour un `Progress` local. `evaluate()` renvoie `completed`
   quand l'objectif est atteint.
4. À la complétion : on écrit un `mission_attempts` + un `wake_log`, on calcule
   le delta de Wake Score, on émet un `wake_event` Realtime au Crew, et seulement
   alors l'alarme se coupe.

Missions V1 : `calc`, `qr_code`, `photo_proof`, `shake`, `steps`, `squats`,
`wake_check`. Ajouter une mission = créer un fichier dans `features/missions/missions/`
et l'enregistrer dans le registre. Aucune autre modification nécessaire.

## 5. Wake Score

Le score ne récompense **pas** seulement le réveil le plus tôt. Formule
(implémentée dans `features/wakeScore/wakeScore.ts`) :

```
base            = 100 si réveil validé à l'heure (dans la fenêtre de grâce)
ponctualité     = -2 par minute de retard (cap -40)
mission         = + bonus selon difficulté (Facile 10 / Strict 25 / Hardcore 50)
zéro snooze     = +15 ; sinon -5 par snooze
wake_check      = +15 si réussi
régularité 7j   = + jusqu'à 30 (ratio de matins validés sur 7 jours)
streak          = +min(streak * 2, 40)
pénalité retard = appliquée via ponctualité
pénalité échec  = -50 si mission échouée / alarme abandonnée
```

Le score quotidien alimente `wake_scores`, agrégé en classements Crew (jour /
semaine / mois) et en `league_entries` pour les ligues mondiales.

## 6. Crew Realtime

Chaque Crew partage un canal Supabase Realtime `crew:{crewId}`.

- **Présence** : statut du matin de chaque membre (`sleeping`, `alarm_ringing`,
  `mission_in_progress`, `wake_verified`, `snoozed`, `late`, `failed`,
  `wake_blast_received`).
- **Broadcast** : `wake_events` (feed live) et Wake Blasts entrants.
- **Postgres Changes** : insertions dans `wake_events` pour le feed persistant.

`features/crew/crewRealtime.ts` expose `subscribeToCrew(crewId, handlers)` qui
renvoie une fonction de désinscription. `useCrewStore` mappe ces événements en
état UI.

## 7. Wake Blast

Un Wake Blast réveille un membre en retard. Les règles d'autorisation sont
centralisées dans `features/wakeBlast/wakeBlast.ts` (`canSendWakeBlast`) et
**re-vérifiées côté serveur** (Edge Function + RLS) :

- le destinataire a explicitement autorisé le Crew (`social_privacy_settings`) ;
- une alarme du destinataire est active **et** il est en retard ;
- on est dans la fenêtre horaire autorisée ;
- la limite de Wake Blasts du matin n'est pas atteinte ;
- l'expéditeur n'est pas bloqué par le destinataire ;
- le mode (Motivation / Roast) respecté.

Types : vocal enregistré, texte → TTS, son prédéfini, vocal collectif, et
Wake Blast par vote du groupe (`wake_blast_votes` → déclenche au quorum).
Jamais de harcèlement : limites strictes, blocage, désactivation des vocaux.

## 8. Limites techniques iOS / Android

Voir `docs/TECH_LIMITS.md`. En résumé : **aucune** garantie d'alarme bloquante
100 % côté iOS sans module natif. Stratégie réaliste en couches :

1. **Notifications locales** programmées (rappel + relances).
2. **Écran alarme plein écran** anti-snooze quand l'app est ouverte.
3. **Backend social** : statut, retard, Wake Blast (push) même app fermée.
4. **Couche native future** (Swift `UNNotification` critique / AVAudioSession,
   Kotlin `AlarmManager` + `FullScreenIntent`) pour fiabiliser réellement.

## 9. Premium (RevenueCat-ready)

`store/useEntitlementsStore.ts` expose `isPremium` et `gate(feature)`. Le MVP
mocke les entitlements ; brancher RevenueCat = remplacer l'implémentation du
store sans toucher aux écrans. Le Paywall lit la liste des features depuis
`constants/premium.ts`.
