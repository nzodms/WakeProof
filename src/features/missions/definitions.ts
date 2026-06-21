import { MissionDefinition } from './types';

// ---------------------------------------------------------------------------
// CALC — résoudre N calculs
// ---------------------------------------------------------------------------
export interface CalcConfig {
  count: number;
  digits: 1 | 2 | 3;
}
export interface CalcProgress {
  solved: number;
}
export const calcMission: MissionDefinition<CalcConfig, CalcProgress> = {
  meta: {
    type: 'calc',
    title: 'Calcul mental',
    subtitle: 'Résous des opérations pour prouver que ton cerveau est ON',
    icon: 'bolt',
    requiresSensor: false,
    requiresCamera: false,
    isPremium: false,
    intensity: 1,
  },
  defaultConfig: { count: 3, digits: 2 },
  createInitialProgress: () => ({ solved: 0 }),
  evaluate: (p, c) => ({
    status: p.solved >= c.count ? 'completed' : 'in_progress',
    completionRatio: Math.min(1, p.solved / c.count),
    hint: `${p.solved}/${c.count} résolus`,
  }),
  describe: (c) => `${c.count} calculs · ${c.digits} chiffres`,
};

// ---------------------------------------------------------------------------
// SHAKE — secouer le téléphone X fois
// ---------------------------------------------------------------------------
export interface ShakeConfig {
  target: number;
}
export interface ShakeProgress {
  shakes: number;
}
export const shakeMission: MissionDefinition<ShakeConfig, ShakeProgress> = {
  meta: {
    type: 'shake',
    title: 'Shake',
    subtitle: 'Secoue le téléphone pour décoller du lit',
    icon: 'bolt',
    requiresSensor: true,
    requiresCamera: false,
    isPremium: false,
    intensity: 2,
  },
  defaultConfig: { target: 25 },
  createInitialProgress: () => ({ shakes: 0 }),
  evaluate: (p, c) => ({
    status: p.shakes >= c.target ? 'completed' : 'in_progress',
    completionRatio: Math.min(1, p.shakes / c.target),
    hint: `${p.shakes}/${c.target} secousses`,
  }),
  describe: (c) => `${c.target} secousses`,
};

// ---------------------------------------------------------------------------
// STEPS — marcher X pas
// ---------------------------------------------------------------------------
export interface StepsConfig {
  target: number;
}
export interface StepsProgress {
  steps: number;
}
export const stepsMission: MissionDefinition<StepsConfig, StepsProgress> = {
  meta: {
    type: 'steps',
    title: 'Marche',
    subtitle: 'Fais quelques pas, sors de la chambre',
    icon: 'mission',
    requiresSensor: true,
    requiresCamera: false,
    isPremium: false,
    intensity: 2,
  },
  defaultConfig: { target: 30 },
  createInitialProgress: () => ({ steps: 0 }),
  evaluate: (p, c) => ({
    status: p.steps >= c.target ? 'completed' : 'in_progress',
    completionRatio: Math.min(1, p.steps / c.target),
    hint: `${p.steps}/${c.target} pas`,
  }),
  describe: (c) => `${c.target} pas`,
};

// ---------------------------------------------------------------------------
// SQUATS — faire X squats (via accéléromètre)
// ---------------------------------------------------------------------------
export interface SquatsConfig {
  target: number;
}
export interface SquatsProgress {
  reps: number;
}
export const squatsMission: MissionDefinition<SquatsConfig, SquatsProgress> = {
  meta: {
    type: 'squats',
    title: 'Squats',
    subtitle: 'Réveille le corps avec quelques squats',
    icon: 'flame',
    requiresSensor: true,
    requiresCamera: false,
    isPremium: true,
    intensity: 3,
  },
  defaultConfig: { target: 10 },
  createInitialProgress: () => ({ reps: 0 }),
  evaluate: (p, c) => ({
    status: p.reps >= c.target ? 'completed' : 'in_progress',
    completionRatio: Math.min(1, p.reps / c.target),
    hint: `${p.reps}/${c.target} squats`,
  }),
  describe: (c) => `${c.target} squats`,
};

// ---------------------------------------------------------------------------
// PHOTO PROOF — photographier un objet/lieu précis
// ---------------------------------------------------------------------------
export interface PhotoProofConfig {
  target: string; // ex: "tasse de café"
  shareMode: 'validated_only' | 'blurred' | 'visible_24h' | 'private';
}
export interface PhotoProofProgress {
  captured: boolean;
}
export const photoProofMission: MissionDefinition<PhotoProofConfig, PhotoProofProgress> = {
  meta: {
    type: 'photo_proof',
    title: 'Photo proof',
    subtitle: 'Prends une photo en direct de ta preuve de réveil',
    icon: 'camera',
    requiresSensor: false,
    requiresCamera: true,
    isPremium: false,
    intensity: 2,
  },
  defaultConfig: { target: 'tasse de café', shareMode: 'validated_only' },
  createInitialProgress: () => ({ captured: false }),
  evaluate: (p) => ({
    status: p.captured ? 'completed' : 'in_progress',
    completionRatio: p.captured ? 1 : 0,
    hint: p.captured ? 'Photo capturée' : 'Photo en direct requise (pas la galerie)',
  }),
  describe: (c) => `Photo : ${c.target}`,
};

// ---------------------------------------------------------------------------
// QR CODE — scanner un QR placé dans une autre pièce
// ---------------------------------------------------------------------------
export interface QrConfig {
  expectedValue: string;
}
export interface QrProgress {
  scanned: boolean;
}
export const qrMission: MissionDefinition<QrConfig, QrProgress> = {
  meta: {
    type: 'qr_code',
    title: 'QR code',
    subtitle: 'Scanne le QR placé dans une autre pièce',
    icon: 'qr',
    requiresSensor: false,
    requiresCamera: true,
    isPremium: false,
    intensity: 3,
  },
  defaultConfig: { expectedValue: 'WAKEPROOF' },
  createInitialProgress: () => ({ scanned: false }),
  evaluate: (p) => ({
    status: p.scanned ? 'completed' : 'in_progress',
    completionRatio: p.scanned ? 1 : 0,
    hint: p.scanned ? 'QR validé' : 'Lève-toi et scanne le bon QR',
  }),
  describe: () => `Scan QR distant`,
};

// ---------------------------------------------------------------------------
// WAKE CHECK — confirmer qu'on est encore réveillé X min après
// ---------------------------------------------------------------------------
export interface WakeCheckConfig {
  delayMin: 5 | 10;
}
export interface WakeCheckProgress {
  confirmed: boolean;
}
export const wakeCheckMission: MissionDefinition<WakeCheckConfig, WakeCheckProgress> = {
  meta: {
    type: 'wake_check',
    title: 'Wake Check',
    subtitle: 'On reviendra vérifier que tu ne t’es pas rendormi',
    icon: 'check',
    requiresSensor: false,
    requiresCamera: false,
    isPremium: true,
    intensity: 2,
  },
  defaultConfig: { delayMin: 5 },
  createInitialProgress: () => ({ confirmed: false }),
  evaluate: (p) => ({
    status: p.confirmed ? 'completed' : 'in_progress',
    completionRatio: p.confirmed ? 1 : 0,
    hint: p.confirmed ? 'Toujours réveillé ✅' : 'Confirme que tu es debout',
  }),
  describe: (c) => `Re-check à +${c.delayMin} min`,
};
