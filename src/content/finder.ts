import type { ServiceId } from '@/config/types';

/**
 * Orientation par symptôme. Ce guide oriente vers une prestation et une démarche :
 * il ne pose aucun diagnostic et ne promet aucun résultat.
 */
export interface Concern {
  id: string;
  label: string;
  services: ServiceId[];
  advice: string;
  /** Message de sécurité affiché en priorité lorsqu'il existe. */
  safety?: string;
}

export const concerns: Concern[] = [
  {
    id: 'voyant',
    label: 'Un voyant s’est allumé',
    services: ['diagnostic', 'batterie'],
    advice:
      'Le diagnostic électronique permet de lire les codes défaut enregistrés par le véhicule. Notez la couleur et la forme du voyant : cela aide l’atelier à préparer votre venue.',
    safety: 'Voyant rouge : arrêtez-vous dès que possible, en sécurité, et appelez avant de reprendre la route.',
  },
  {
    id: 'freins',
    label: 'Bruit ou vibration au freinage',
    services: ['freinage', 'suspension'],
    advice: 'Un contrôle des plaquettes et des disques permet d’identifier l’origine du bruit. Plus il est fait tôt, moins l’intervention est lourde.',
    safety: 'Si la pédale s’enfonce ou si le freinage est nettement moins efficace, évitez de rouler et contactez l’atelier.',
  },
  {
    id: 'demarrage',
    label: 'Démarrage difficile',
    services: ['batterie', 'diagnostic'],
    advice: 'Le test de la batterie et du circuit de charge permet de savoir si la batterie, l’alternateur ou le démarreur est en cause.',
  },
  {
    id: 'clim',
    label: 'La climatisation ne refroidit plus',
    services: ['climatisation'],
    advice: 'Un contrôle d’efficacité et d’étanchéité indique si une recharge suffit ou si une fuite doit être recherchée.',
  },
  {
    id: 'pneus',
    label: 'Pneu usé, crevé ou sous-gonflé',
    services: ['pneumatiques', 'suspension'],
    advice: 'L’atelier contrôle l’usure et la réparabilité. Une usure sur un seul bord peut aussi signaler un défaut de parallélisme.',
  },
  {
    id: 'tenue',
    label: 'La voiture tire d’un côté',
    services: ['suspension', 'pneumatiques'],
    advice: 'Le contrôle du parallélisme, des amortisseurs et des pneus permet d’identifier la cause d’une tenue de route dégradée.',
  },
  {
    id: 'embrayage',
    label: 'L’embrayage patine, les vitesses accrochent',
    services: ['embrayage'],
    advice: 'Un contrôle de l’embrayage et de sa commande permet d’intervenir avant d’endommager le volant moteur.',
  },
  {
    id: 'echappement',
    label: 'Bruit d’échappement ou fumée',
    services: ['echappement', 'diagnostic'],
    advice: 'La ligne d’échappement est contrôlée sur pont ; une fumée inhabituelle peut nécessiter un diagnostic complémentaire.',
  },
  {
    id: 'revision',
    label: 'C’est l’heure de la révision',
    services: ['entretien', 'distribution'],
    advice:
      'Munissez-vous du carnet d’entretien ou du kilométrage actuel : l’atelier vérifie les opérations prévues à cette échéance, y compris la distribution.',
  },
  {
    id: 'autre',
    label: 'Autre chose',
    services: ['diagnostic'],
    advice: 'Décrivez ce que vous avez remarqué, depuis quand et dans quelles conditions : l’atelier vous rappelle pour vous orienter.',
  },
];
