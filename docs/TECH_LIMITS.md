# WakeProof — Limites techniques de l'alarme (iOS / Android)

Honnêteté technique : **on ne peut pas promettre une alarme 100 % bloquante en
Expo Go pur, surtout sur iOS.** Voici la réalité et la stratégie en couches.

## iOS

| Capacité                                   | Réalité |
| ------------------------------------------ | ------- |
| Notification locale à heure fixe           | ✅ Fiable (`expo-notifications`). |
| Son personnalisé long en notification      | ⚠️ Limité (~30 s max, son court). |
| Lancer un écran plein écran app fermée     | ❌ Impossible sans interaction. iOS ne réveille pas l'app pour afficher une UI. |
| Empêcher de couper la notif                | ❌ L'utilisateur peut ignorer/swiper. |
| Notifications critiques (son fort, DND)    | ⚠️ Nécessite **entitlement Apple** (`com.apple.developer.usernotifications.critical-alerts`) — demande à approuver. Module natif requis. |
| Audio en background                        | ⚠️ Possible via `UIBackgroundModes: audio` mais Apple peut suspendre. |

**Conclusion iOS** : tant que l'app est ouverte/au premier plan, on contrôle
tout (écran alarme + mission anti-snooze). App fermée : on s'appuie sur des
notifications répétées + la pression sociale (Wake Blasts push). Pour une vraie
alarme bloquante, il faut un build natif (EAS) avec entitlement *critical alerts*.

## Android

| Capacité                                   | Réalité |
| ------------------------------------------ | ------- |
| Alarme exacte                              | ✅ `AlarmManager.setExactAndAllowWhileIdle` (perm `SCHEDULE_EXACT_ALARM`). |
| Écran plein écran app fermée               | ✅ `FullScreenIntent` (perm `USE_FULL_SCREEN_INTENT`). |
| Son long / boucle                          | ✅ Foreground service + `WAKE_LOCK`. |
| Contourner Doze                            | ✅ `setAndAllowWhileIdle`. |

**Conclusion Android** : alarme fiable possible, mais le `FullScreenIntent` et
le foreground service exigent un **module natif** (Kotlin) + build EAS. Expo Go
ne suffit pas.

## Stratégie WakeProof en 4 couches

1. **MVP (Expo managé)** — notifications locales programmées (`alarm_schedules`),
   relances espacées, et écran alarme anti-snooze quand l'app est au premier plan.
2. **Pression sociale (backend)** — statut de retard détecté serveur → push
   notifications Wake Blast, même app fermée. C'est le vrai levier psychologique.
3. **Dev build EAS** — sons longs, audio background, `FullScreenIntent` Android.
4. **Modules natifs (v2)** — Swift (critical alerts, AVAudioSession) + Kotlin
   (`AlarmManager` + foreground service) pour une alarme réellement bloquante.

Le code app est conçu pour que le passage couche 1 → 4 se fasse en remplaçant
l'implémentation de `lib/notifications.ts` et `lib/alarmScheduler.ts` sans
toucher aux écrans.
