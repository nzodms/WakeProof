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

## Déploiement web (Vercel)

WakeProof est une app Expo : pour la voir dans un navigateur (et sur Vercel),
on exporte la version **web** (react-native-web).

- Build local : `npm run build:web` → sortie statique dans `dist/`.
- Vercel : la config est dans `vercel.json` (build `expo export --platform web`,
  output `dist/`, rewrites SPA). Vercel détecte tout automatiquement — il suffit
  d'importer le repo. Aucune variable n'est requise (mode démo) ; ajoute
  `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` dans les env vars
  Vercel pour passer en mode live.

> Note : certaines fonctions natives (alarmes locales, capteurs, caméra,
> stockage chiffré) sont dégradées ou indisponibles sur le web — la cible web
> sert surtout à **présenter l'UI**. L'app réelle tourne sur iOS/Android.

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
