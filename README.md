# WakeProof 🔆

> Le réveil qui te force à te lever — et tes potes peuvent t'aider si tu fais le mort.

Réveil social à missions : une alarme ne se coupe pas tant que la mission n'est
pas accomplie. Autour : Crews privés, preuves de réveil, Wake Blasts vocaux,
Wake Score, classements, ligues et challenges.

## Stack

React Native + **Expo (SDK 51)** · TypeScript strict · **Supabase** (Auth, DB,
Storage, Realtime) · React Navigation · **Zustand** · Reanimated 3 · RevenueCat-ready.

## Démarrage

```bash
npm install
cp .env.example .env      # renseigne SUPABASE_URL et ANON_KEY
npm start                 # puis i (iOS) / a (Android)
```

Sans `.env`, l'app tourne en **mode démo** (données mockées, pas de réseau) —
parfait pour explorer l'UI.

### Backend

Exécute `supabase/schema.sql` dans le SQL Editor de ton projet Supabase
(tables, enums, RLS, triggers). Crée un bucket Storage `wake-proofs` pour les
photos de preuve.

## Architecture

Voir [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — structure, MissionEngine,
Wake Score, Crew Realtime, Wake Blast. Limites réelles de l'alarme iOS/Android :
[`docs/TECH_LIMITS.md`](docs/TECH_LIMITS.md).

```
src/
  theme/         Design system (Liquid Glass, clair/sombre)
  components/    glass · ui · navigation (LiquidGlassTabBar)
  navigation/    Root stack + tabs
  screens/       onboarding · alarm · missions · crew · leaderboard · profile · paywall
  features/      missions (MissionEngine) · wakeScore · wakeBlast · crew · leagues
  store/         Zustand
  lib/           supabase · haptics · notifications · format
  constants/     catégories · premium · démo
```

## Statut

MVP front complet (UI + logique métier) avec stubs backend clairement marqués
(`// Ici : ...`). Les missions calc/shake/steps/squats/photo/QR sont réellement
jouables. L'alarme bloquante 100 % nécessite un dev build EAS + module natif
(documenté).
