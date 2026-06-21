import { MissionType } from '@/types/domain';

export type MissionStatus = 'idle' | 'in_progress' | 'completed' | 'failed';

export interface MissionEvaluation {
  status: MissionStatus;
  /** 0 → 1, pour la barre de progression de l'écran d'exécution. */
  completionRatio: number;
  /** Texte d'aide affiché sous la mission. */
  hint?: string;
}

export interface MissionMeta {
  type: MissionType;
  title: string;
  subtitle: string;
  icon: string;
  /** Capteur requis ? Influence la dispo selon l'appareil. */
  requiresSensor: boolean;
  requiresCamera: boolean;
  isPremium: boolean;
  /** Niveau de friction (1 = facile, 3 = hardcore). Sert au Wake Score. */
  intensity: 1 | 2 | 3;
}

/**
 * Contrat commun à toutes les missions. `Config` = paramètres choisis à la
 * création de l'alarme. `Progress` = état mutable pendant l'exécution.
 */
export interface MissionDefinition<Config = unknown, Progress = unknown> {
  meta: MissionMeta;
  defaultConfig: Config;
  createInitialProgress: (config: Config) => Progress;
  evaluate: (progress: Progress, config: Config) => MissionEvaluation;
  /** Résumé lisible de la config pour l'UI (ex: "3 calculs · difficile"). */
  describe: (config: Config) => string;
}
