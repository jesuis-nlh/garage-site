import type { ServiceId } from '@/config/types';

/**
 * Catalogue générique des prestations, réutilisable d'un garage à l'autre.
 * Chaque garage choisit dans sa configuration les prestations qu'il propose réellement
 * et peut surcharger les textes. Aucun prix ici : un tarif n'est publié que s'il est vérifié.
 */

export type ServiceCategory = 'entretien' | 'securite' | 'mecanique' | 'electrique';

export const categories: { id: ServiceCategory; label: string }[] = [
  { id: 'entretien', label: 'Entretien' },
  { id: 'securite', label: 'Sécurité & liaison au sol' },
  { id: 'mecanique', label: 'Mécanique' },
  { id: 'electrique', label: 'Électricité & confort' },
];

export type Glyph = 'oil' | 'scan' | 'brake' | 'tire' | 'shock' | 'snow' | 'battery' | 'clutch' | 'belt' | 'exhaust' | 'plug';

export interface ServiceDefinition {
  id: ServiceId;
  slug: string;
  title: string;
  category: ServiceCategory;
  glyph: Glyph;
  /** Sous-titre technique court. */
  kicker: string;
  short: string;
  long: string;
  includes: string[];
  /** Signes qui doivent alerter le conducteur (pédagogie, pas de diagnostic à distance). */
  signs: string[];
  /** Requête locale principale ciblée par la page. */
  seoKeyword: string;
}

export const serviceCatalogue: Record<ServiceId, ServiceDefinition> = {
  entretien: {
    id: 'entretien',
    slug: 'entretien-revision',
    title: 'Entretien & révision',
    category: 'entretien',
    glyph: 'oil',
    kicker: 'Vidange · filtres · points de contrôle',
    short: 'Vidange, remplacement des filtres et contrôle des organes essentiels, selon le programme de votre constructeur.',
    long: 'La révision suit le carnet d’entretien de votre véhicule : vidange de l’huile moteur, remplacement des filtres concernés et vérification des points de sécurité. C’est la meilleure façon de préserver la fiabilité du moteur, de limiter les pannes et de conserver un historique d’entretien clair à la revente.',
    includes: [
      'Vidange de l’huile moteur et remplacement du filtre à huile',
      'Filtres à air, à habitacle et à carburant selon l’échéance',
      'Contrôle des niveaux et appoints',
      'Vérification des freins, pneus, éclairage et essuie-glaces',
      'Mise à jour du carnet d’entretien',
    ],
    signs: ['L’échéance kilométrique ou annuelle est atteinte', 'Le voyant de maintenance s’affiche', 'Le niveau d’huile baisse entre deux révisions'],
    seoKeyword: 'entretien voiture',
  },
  diagnostic: {
    id: 'diagnostic',
    slug: 'diagnostic-electronique',
    title: 'Diagnostic électronique',
    category: 'electrique',
    glyph: 'scan',
    kicker: 'Lecture des codes défaut · calculateurs',
    short: 'Lecture des codes défaut enregistrés par les calculateurs pour comprendre l’origine d’un voyant ou d’un dysfonctionnement.',
    long: 'Les véhicules modernes enregistrent les anomalies détectées par leurs capteurs. Le diagnostic électronique consiste à lire ces informations avec un outil adapté, puis à les interpréter et à les vérifier sur le véhicule. Il permet d’orienter la réparation au lieu de remplacer des pièces au hasard.',
    includes: [
      'Branchement sur la prise de diagnostic du véhicule',
      'Lecture et interprétation des codes défaut',
      'Contrôles complémentaires sur les éléments suspectés',
      'Explication des résultats et proposition de devis',
    ],
    signs: [
      'Un voyant moteur ou ABS est allumé',
      'Le moteur manque de puissance ou passe en mode dégradé',
      'Un comportement inhabituel apparaît par intermittence',
    ],
    seoKeyword: 'diagnostic automobile',
  },
  freinage: {
    id: 'freinage',
    slug: 'freinage',
    title: 'Freinage',
    category: 'securite',
    glyph: 'brake',
    kicker: 'Plaquettes · disques · liquide',
    short: 'Contrôle et remplacement des plaquettes, disques et liquide de frein pour un freinage sûr et constant.',
    long: 'Le système de freinage est l’élément de sécurité le plus sollicité de votre voiture. Son contrôle porte sur l’épaisseur des plaquettes, l’état des disques, le liquide de frein et l’absence de fuite. Une usure détectée tôt évite d’abîmer les disques et coûte moins cher.',
    includes: [
      'Mesure de l’usure des plaquettes et des disques',
      'Remplacement des plaquettes, disques, tambours ou mâchoires',
      'Purge et remplacement du liquide de frein',
      'Contrôle du frein de stationnement',
    ],
    signs: ['Un grincement ou un sifflement au freinage', 'Des vibrations dans la pédale ou le volant', 'La pédale paraît plus molle ou s’enfonce davantage'],
    seoKeyword: 'freinage voiture',
  },
  pneumatiques: {
    id: 'pneumatiques',
    slug: 'pneus',
    title: 'Pneumatiques',
    category: 'securite',
    glyph: 'tire',
    kicker: 'Montage · équilibrage · réparation',
    short: 'Montage, équilibrage et contrôle de vos pneus pour une adhérence et une consommation maîtrisées.',
    long: 'Les pneus sont le seul point de contact entre votre voiture et la route. Une pression correcte, une usure régulière et un équilibrage soigné améliorent la tenue de route, le freinage et la consommation. L’atelier vous conseille sur les dimensions et les usages adaptés à votre véhicule.',
    includes: [
      'Contrôle de l’usure et de la pression',
      'Montage et équilibrage',
      'Réparation lorsque la crevaison le permet',
      'Conseil sur les pneus été, hiver ou toutes saisons',
    ],
    signs: ['Des témoins d’usure affleurent sur la bande de roulement', 'Le voyant de pression des pneus est allumé', 'Le volant vibre à certaines vitesses'],
    seoKeyword: 'pneus',
  },
  suspension: {
    id: 'suspension',
    slug: 'suspension-geometrie',
    title: 'Suspension & géométrie',
    category: 'securite',
    glyph: 'shock',
    kicker: 'Amortisseurs · parallélisme',
    short: 'Amortisseurs, éléments de train avant et parallélisme pour une voiture stable et des pneus qui s’usent régulièrement.',
    long: 'Des amortisseurs fatigués allongent les distances de freinage et dégradent la stabilité, surtout sur route mouillée. Un parallélisme déréglé use les pneus de façon irrégulière et fait tirer la voiture d’un côté. Le contrôle de la suspension et de la géométrie protège votre sécurité et vos pneus.',
    includes: [
      'Contrôle des amortisseurs, coupelles et ressorts',
      'Vérification des rotules, biellettes et silentblocs',
      'Réglage du parallélisme',
      'Essai routier de validation',
    ],
    signs: ['La voiture tire d’un côté', 'Les pneus s’usent sur un seul bord', 'La voiture rebondit ou plonge au freinage'],
    seoKeyword: 'amortisseurs parallélisme',
  },
  climatisation: {
    id: 'climatisation',
    slug: 'climatisation',
    title: 'Climatisation',
    category: 'electrique',
    glyph: 'snow',
    kicker: 'Recharge · contrôle d’étanchéité',
    short: 'Contrôle, recharge et entretien du circuit de climatisation pour retrouver un air frais et sain.',
    long: 'Un circuit de climatisation perd naturellement une partie de son gaz au fil du temps. Le contrôle porte sur l’efficacité, l’étanchéité et le filtre d’habitacle. Une climatisation entretenue refroidit mieux, désembue plus vite et limite les odeurs.',
    includes: [
      'Contrôle de l’efficacité et de l’étanchéité',
      'Recharge du circuit selon la quantité préconisée',
      'Remplacement du filtre d’habitacle',
      'Traitement de l’évaporateur si nécessaire',
    ],
    signs: ['L’air soufflé n’est plus assez froid', 'Une odeur désagréable à la mise en route', 'Les vitres désembuent difficilement'],
    seoKeyword: 'recharge climatisation',
  },
  batterie: {
    id: 'batterie',
    slug: 'batterie-electricite',
    title: 'Batterie & électricité',
    category: 'electrique',
    glyph: 'battery',
    kicker: 'Test de charge · démarreur · alternateur',
    short: 'Test de la batterie et du circuit de charge, remplacement et contrôle des équipements électriques.',
    long: 'Un démarrage difficile ne vient pas toujours de la batterie : l’alternateur ou le démarreur peuvent aussi être en cause. Le test du circuit de charge permet d’identifier l’élément défaillant avant de remplacer quoi que ce soit.',
    includes: [
      'Test de la batterie et du circuit de charge',
      'Remplacement de la batterie adaptée à votre véhicule',
      'Contrôle de l’alternateur et du démarreur',
      'Ampoules, fusibles et éclairage',
    ],
    signs: ['Le moteur peine à démarrer, surtout par temps froid', 'Le voyant de batterie s’allume en roulant', 'Des équipements électriques fonctionnent mal'],
    seoKeyword: 'batterie voiture',
  },
  embrayage: {
    id: 'embrayage',
    slug: 'embrayage-transmission',
    title: 'Embrayage & transmission',
    category: 'mecanique',
    glyph: 'clutch',
    kicker: 'Kit d’embrayage · volant moteur',
    short: 'Contrôle et remplacement du kit d’embrayage et des éléments de transmission.',
    long: 'L’embrayage s’use progressivement, selon votre conduite et vos trajets. Un embrayage qui patine ou des vitesses qui accrochent doivent être contrôlés sans attendre : une intervention anticipée évite d’endommager d’autres pièces, comme le volant moteur.',
    includes: [
      'Contrôle de l’embrayage et de la commande',
      'Remplacement du kit d’embrayage',
      'Contrôle du volant moteur',
      'Cardans et soufflets de transmission',
    ],
    signs: [
      'Le moteur monte dans les tours sans que la voiture accélère',
      'Les vitesses passent difficilement',
      'La pédale devient dure ou le point de patinage remonte',
    ],
    seoKeyword: 'embrayage',
  },
  distribution: {
    id: 'distribution',
    slug: 'distribution-moteur',
    title: 'Distribution & moteur',
    category: 'mecanique',
    glyph: 'belt',
    kicker: 'Courroie · pompe à eau · galets',
    short: 'Remplacement de la courroie ou du kit de distribution à l’échéance prévue par le constructeur.',
    long: 'La courroie de distribution synchronise les éléments internes du moteur. Sa rupture peut entraîner une casse moteur coûteuse : son remplacement doit respecter l’échéance indiquée par le constructeur, en kilomètres ou en années, selon la première atteinte.',
    includes: [
      'Vérification de l’échéance constructeur',
      'Remplacement du kit de distribution (courroie, galets)',
      'Remplacement de la pompe à eau si préconisé',
      'Contrôle du circuit de refroidissement',
    ],
    signs: ['L’échéance kilométrique ou d’âge approche', 'Un bruit de cliquetis ou de sifflement côté moteur', 'Une fuite de liquide de refroidissement'],
    seoKeyword: 'courroie de distribution',
  },
  echappement: {
    id: 'echappement',
    slug: 'echappement',
    title: 'Échappement',
    category: 'mecanique',
    glyph: 'exhaust',
    kicker: 'Silencieux · catalyseur · FAP',
    short: 'Contrôle et remplacement des éléments d’échappement, du catalyseur et du filtre à particules.',
    long: 'Une ligne d’échappement en bon état limite le bruit et les émissions polluantes, et conditionne le passage au contrôle technique. Un échappement percé ou un filtre à particules encrassé se manifestent souvent par un bruit, une odeur ou un voyant.',
    includes: [
      'Contrôle de la ligne et des fixations',
      'Remplacement des silencieux et tubulures',
      'Contrôle du catalyseur et du filtre à particules',
      'Recherche de fuites',
    ],
    signs: ['Un bruit d’échappement plus fort qu’à l’habitude', 'Une odeur de gaz d’échappement dans l’habitacle', 'Le voyant moteur ou FAP s’allume'],
    seoKeyword: 'échappement',
  },
  hybride: {
    id: 'hybride',
    slug: 'hybride-electrique',
    title: 'Hybrides & électriques',
    category: 'electrique',
    glyph: 'plug',
    kicker: 'Entretien spécifique · habilitation',
    short: 'Entretien des véhicules hybrides et électriques par des techniciens habilités.',
    long: 'Les véhicules hybrides et électriques ont un entretien spécifique et exigent des techniciens habilités pour intervenir à proximité des circuits haute tension. À n’activer que si le garage dispose des habilitations correspondantes.',
    includes: [
      'Entretien selon le programme constructeur',
      'Contrôle du circuit de refroidissement de la batterie',
      'Freinage et liaisons au sol',
      'Diagnostic des systèmes',
    ],
    signs: ['Un message d’alerte du système hybride', 'Une autonomie en baisse inhabituelle', 'L’échéance d’entretien est atteinte'],
    seoKeyword: 'entretien voiture hybride',
  },
};
