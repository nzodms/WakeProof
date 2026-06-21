import { MissionType } from '@/types/domain';
import { MissionDefinition } from './types';
import {
  calcMission,
  photoProofMission,
  qrMission,
  shakeMission,
  squatsMission,
  stepsMission,
  wakeCheckMission,
} from './definitions';

/**
 * Registre central des missions. Ajouter une mission = enregistrer ici une
 * `MissionDefinition`. Aucune autre partie de l'app n'a besoin de changer :
 * écrans, Wake Score et setup lisent l'engine.
 */
class MissionEngineImpl {
  private registry = new Map<MissionType, MissionDefinition<any, any>>();

  register(def: MissionDefinition<any, any>) {
    this.registry.set(def.meta.type, def);
  }

  get(type: MissionType): MissionDefinition<any, any> {
    const def = this.registry.get(type);
    if (!def) throw new Error(`Mission inconnue: ${type}`);
    return def;
  }

  has(type: MissionType): boolean {
    return this.registry.has(type);
  }

  list(): MissionDefinition<any, any>[] {
    return [...this.registry.values()];
  }

  /** Missions disponibles selon premium + capacités appareil. */
  available(opts: { isPremium: boolean; hasSensors: boolean; hasCamera: boolean }) {
    return this.list().filter((d) => {
      if (d.meta.isPremium && !opts.isPremium) return false;
      if (d.meta.requiresSensor && !opts.hasSensors) return false;
      if (d.meta.requiresCamera && !opts.hasCamera) return false;
      return true;
    });
  }
}

export const MissionEngine = new MissionEngineImpl();

MissionEngine.register(calcMission);
MissionEngine.register(shakeMission);
MissionEngine.register(stepsMission);
MissionEngine.register(squatsMission);
MissionEngine.register(photoProofMission);
MissionEngine.register(qrMission);
MissionEngine.register(wakeCheckMission);
