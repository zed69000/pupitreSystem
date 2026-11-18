// Charge le noyau et les partitions d'exemple pour les tests (sans navigateur).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { NOYAU, Ecriture } from '../src/pupitre.js';

export const K = NOYAU();
const bac = { PupitreEcriture: Ecriture };
vm.createContext(bac);
vm.runInContext(readFileSync(new URL('../exemples/partitions.js', import.meta.url), 'utf8') + ';this.serment=partitionSerment;this.soul=partitionSoul;', bac);
export const partitionSerment = c => bac.serment(c);
export const partitionSoul = () => bac.soul();
