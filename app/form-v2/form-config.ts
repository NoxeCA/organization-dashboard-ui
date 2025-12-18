export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "file"
  | "date"
  | "number"
  | "email"
  | "phone"
  | "problem-list";

// Structure for a single problem entry
export interface ProblemEntry {
  id: string;
  equipmentType: string;
  equipmentProblem: string;
  equipmentId: string;
  location: string;
  description: string;
  attachments?: File[];
}

// Default empty problem
export const createEmptyProblem = (): ProblemEntry => ({
  id: crypto.randomUUID(),
  equipmentType: "",
  equipmentProblem: "",
  equipmentId: "",
  location: "",
  description: "",
  attachments: [],
});

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: FieldOption[];
  helperText?: string;
  maxLength?: number;
  minLength?: number;
  dependsOn?: {
    field: string;
    values: string[];
  };
}

export interface RequestTypeConfig {
  id: string;
  label: string;
  description: string;
  category: "support" | "quote" | "training" | "other";
  icon: string;
  fields: FormField[];
  supportsMultipleProblems?: boolean; // When true, allows user to report multiple problems
}

// Equipment type options (shared for problem list)
export const equipmentTypeOptions: FieldOption[] = [
  { value: "video-surveillance", label: "Vidéosurveillance" },
  { value: "access-control", label: "Contrôle d'accès" },
  { value: "intercom", label: "Interphone" },
  { value: "vehicle-gate", label: "Barrière véhicule" },
  { value: "turnstile", label: "Tourniquet" },
  { value: "alarm", label: "Système d'alarme" },
  { value: "software", label: "Logiciel" },
  { value: "other", label: "Autre" },
];

// Equipment problem options (shared for problem list)
export const equipmentProblemOptions: FieldOption[] = [
  { value: "not-working", label: "Ne fonctionne plus" },
  { value: "intermittent", label: "Fonctionnement intermittent" },
  { value: "degraded", label: "Performance dégradée" },
  { value: "damage", label: "Dommage physique" },
  { value: "configuration", label: "Problème de configuration" },
  { value: "other", label: "Autre" },
];

// Common field definitions that can be reused
const commonFields = {
  title: {
    id: "title",
    type: "text" as FieldType,
    label: "Titre de la demande",
    placeholder: "Décrivez brièvement votre demande",
    required: true,
    maxLength: 100,
  },
  description: {
    id: "description",
    type: "textarea" as FieldType,
    label: "Description détaillée",
    placeholder: "Décrivez votre demande en détail...",
    required: true,
    maxLength: 2000,
  },
  priority: {
    id: "priority",
    type: "select" as FieldType,
    label: "Priorité",
    required: true,
    options: [
      { value: "low", label: "Basse" },
      { value: "medium", label: "Moyenne" },
      { value: "high", label: "Haute" },
      { value: "critical", label: "Critique" },
    ],
  },
  site: {
    id: "site",
    type: "select" as FieldType,
    label: "Site concerné",
    required: true,
    options: [
      { value: "pavilion-a", label: "Pavillon A" },
      { value: "pavilion-b", label: "Pavillon B" },
      { value: "pavilion-c", label: "Pavillon C" },
      { value: "headquarters", label: "Siège social" },
      { value: "warehouse", label: "Entrepôt" },
    ],
  },
  location: {
    id: "location",
    type: "text" as FieldType,
    label: "Emplacement précis",
    placeholder: "Ex: Étage 3, salle 204",
    maxLength: 250,
  },
  equipmentType: {
    id: "equipmentType",
    type: "select" as FieldType,
    label: "Type d'équipement",
    required: true,
    options: [
      { value: "video-surveillance", label: "Vidéosurveillance" },
      { value: "access-control", label: "Contrôle d'accès" },
      { value: "intercom", label: "Interphone" },
      { value: "vehicle-gate", label: "Barrière véhicule" },
      { value: "turnstile", label: "Tourniquet" },
      { value: "alarm", label: "Système d'alarme" },
      { value: "software", label: "Logiciel" },
      { value: "other", label: "Autre" },
    ],
  },
  equipmentProblem: {
    id: "equipmentProblem",
    type: "select" as FieldType,
    label: "Type de problème",
    required: true,
    options: [
      { value: "not-working", label: "Ne fonctionne plus" },
      { value: "intermittent", label: "Fonctionnement intermittent" },
      { value: "degraded", label: "Performance dégradée" },
      { value: "damage", label: "Dommage physique" },
      { value: "configuration", label: "Problème de configuration" },
      { value: "other", label: "Autre" },
    ],
  },
  equipmentId: {
    id: "equipmentId",
    type: "text" as FieldType,
    label: "Identifiant de l'équipement",
    placeholder: "Ex: CAM-A-101",
    helperText: "Si connu, entrez l'identifiant de l'équipement concerné",
    maxLength: 50,
  },
  attachments: {
    id: "attachments",
    type: "file" as FieldType,
    label: "Pièces jointes",
    helperText: "Photos, captures d'écran ou documents pertinents",
  },
  preferredDate: {
    id: "preferredDate",
    type: "date" as FieldType,
    label: "Date souhaitée",
    helperText: "Indiquez votre date préférée pour l'intervention",
  },
  contactPhone: {
    id: "contactPhone",
    type: "phone" as FieldType,
    label: "Téléphone de contact",
    placeholder: "+33 6 12 34 56 78",
  },
};

// Request type configurations
export const requestTypes: RequestTypeConfig[] = [
  // ============ SUPPORT CATEGORY ============
  {
    id: "remote-support",
    label: "Assistance technique à distance",
    description: "Obtenez une aide technique par téléphone ou connexion à distance",
    category: "support",
    icon: "Headphones",
    supportsMultipleProblems: true,
    fields: [
      commonFields.priority,
      {
        id: "problems",
        type: "problem-list",
        label: "Détails du problème",
        required: true,
        helperText: "Décrivez votre problème. Vous pouvez signaler plusieurs équipements si nécessaire.",
      },
      {
        id: "remoteAccessAvailable",
        type: "radio",
        label: "Accès à distance disponible ?",
        required: true,
        options: [
          { value: "yes", label: "Oui, accès à distance configuré" },
          { value: "no", label: "Non, pas d'accès à distance" },
          { value: "unknown", label: "Je ne sais pas" },
        ],
      },
      commonFields.contactPhone,
    ],
  },
  {
    id: "onsite-support",
    label: "Assistance technique sur site",
    description: "Demandez l'intervention d'un technicien sur place",
    category: "support",
    icon: "Wrench",
    supportsMultipleProblems: true,
    fields: [
      commonFields.priority,
      commonFields.site,
      {
        id: "problems",
        type: "problem-list",
        label: "Détails du problème",
        required: true,
        helperText: "Décrivez votre problème. Vous pouvez signaler plusieurs équipements si nécessaire.",
      },
      commonFields.preferredDate,
      {
        id: "accessInstructions",
        type: "textarea",
        label: "Instructions d'accès",
        placeholder: "Comment accéder au site et à l'équipement...",
        helperText: "Badges nécessaires, horaires d'accès, contact sur place, etc.",
        maxLength: 500,
      },
      commonFields.contactPhone,
    ],
  },
  {
    id: "warranty",
    label: "Garantie",
    description: "Déclarez un problème couvert par la garantie",
    category: "support",
    icon: "Shield",
    supportsMultipleProblems: true,
    fields: [
      commonFields.site,
      {
        id: "problems",
        type: "problem-list",
        label: "Détails de la réclamation",
        required: true,
        helperText: "Décrivez le problème. Vous pouvez signaler plusieurs équipements si nécessaire.",
      },
      {
        id: "purchaseDate",
        type: "date",
        label: "Date d'achat/installation",
        required: true,
        helperText: "Date approximative si vous n'êtes pas certain",
      },
      {
        id: "invoiceNumber",
        type: "text",
        label: "Numéro de facture",
        placeholder: "Ex: FAC-2024-001234",
        helperText: "Si disponible",
      },
    ],
  },
  {
    id: "preventive-maintenance",
    label: "Maintenance préventive",
    description: "Planifiez une maintenance préventive de vos équipements",
    category: "support",
    icon: "Calendar",
    fields: [
      commonFields.title,
      commonFields.description,
      commonFields.site,
      {
        id: "equipmentTypes",
        type: "multiselect",
        label: "Équipements concernés",
        required: true,
        options: [
          { value: "video-surveillance", label: "Vidéosurveillance" },
          { value: "access-control", label: "Contrôle d'accès" },
          { value: "intercom", label: "Interphone" },
          { value: "vehicle-gate", label: "Barrière véhicule" },
          { value: "turnstile", label: "Tourniquet" },
          { value: "alarm", label: "Système d'alarme" },
        ],
      },
      commonFields.preferredDate,
      {
        id: "maintenanceScope",
        type: "radio",
        label: "Étendue de la maintenance",
        required: true,
        options: [
          { value: "full", label: "Maintenance complète du site" },
          { value: "partial", label: "Équipements spécifiques seulement" },
        ],
      },
      {
        id: "accessInstructions",
        type: "textarea",
        label: "Instructions d'accès",
        placeholder: "Comment accéder au site...",
        maxLength: 500,
      },
      commonFields.contactPhone,
    ],
  },
  {
    id: "equipment-modification",
    label: "Ajout ou modification d'équipement",
    description: "Demandez l'ajout ou la modification d'équipements existants",
    category: "support",
    icon: "Settings",
    fields: [
      commonFields.title,
      commonFields.description,
      commonFields.priority,
      commonFields.site,
      commonFields.location,
      {
        id: "modificationType",
        type: "radio",
        label: "Type de demande",
        required: true,
        options: [
          { value: "add", label: "Ajout d'équipement" },
          { value: "modify", label: "Modification d'équipement existant" },
          { value: "relocate", label: "Déplacement d'équipement" },
          { value: "remove", label: "Retrait d'équipement" },
        ],
      },
      commonFields.equipmentType,
      commonFields.equipmentId,
      {
        id: "currentSetup",
        type: "textarea",
        label: "Configuration actuelle",
        placeholder: "Décrivez la configuration existante...",
        maxLength: 1000,
      },
      {
        id: "desiredChanges",
        type: "textarea",
        label: "Modifications souhaitées",
        placeholder: "Décrivez les changements souhaités...",
        required: true,
        maxLength: 1000,
      },
      commonFields.preferredDate,
      commonFields.attachments,
    ],
  },

  // ============ QUOTE CATEGORY ============
  {
    id: "quote-physical-security",
    label: "Demande de prix pour de la sécurité physique",
    description: "Obtenez un devis pour des équipements de sécurité physique",
    category: "quote",
    icon: "FileText",
    fields: [
      commonFields.title,
      {
        id: "projectDescription",
        type: "textarea",
        label: "Description du projet",
        placeholder: "Décrivez votre projet de sécurité...",
        required: true,
        maxLength: 2000,
      },
      commonFields.site,
      {
        id: "securityNeeds",
        type: "multiselect",
        label: "Besoins en sécurité",
        required: true,
        options: [
          { value: "video-surveillance", label: "Vidéosurveillance" },
          { value: "access-control", label: "Contrôle d'accès" },
          { value: "intercom", label: "Interphone / Visiophone" },
          { value: "intrusion-alarm", label: "Alarme intrusion" },
          { value: "vehicle-barrier", label: "Barrière / Portail véhicule" },
          { value: "turnstile", label: "Tourniquet / Portillon" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "projectScope",
        type: "radio",
        label: "Type de projet",
        required: true,
        options: [
          { value: "new", label: "Nouvelle installation" },
          { value: "extension", label: "Extension d'un système existant" },
          { value: "replacement", label: "Remplacement de matériel" },
        ],
      },
      {
        id: "budget",
        type: "select",
        label: "Budget approximatif",
        options: [
          { value: "under-5k", label: "Moins de 5 000 €" },
          { value: "5k-15k", label: "5 000 € - 15 000 €" },
          { value: "15k-50k", label: "15 000 € - 50 000 €" },
          { value: "over-50k", label: "Plus de 50 000 €" },
          { value: "unknown", label: "À définir" },
        ],
      },
      {
        id: "timeline",
        type: "select",
        label: "Délai souhaité",
        options: [
          { value: "urgent", label: "Urgent (< 2 semaines)" },
          { value: "1-month", label: "Dans le mois" },
          { value: "3-months", label: "Dans les 3 mois" },
          { value: "flexible", label: "Flexible" },
        ],
      },
      {
        id: "siteVisitRequired",
        type: "radio",
        label: "Visite de site nécessaire ?",
        options: [
          { value: "yes", label: "Oui, une visite serait utile" },
          { value: "no", label: "Non, j'ai toutes les informations" },
        ],
      },
      commonFields.contactPhone,
      commonFields.attachments,
    ],
  },
  {
    id: "quote-software-dev",
    label: "Demande de prix du développement logiciel",
    description: "Obtenez un devis pour un développement logiciel personnalisé",
    category: "quote",
    icon: "Code",
    fields: [
      commonFields.title,
      {
        id: "projectDescription",
        type: "textarea",
        label: "Description du projet",
        placeholder: "Décrivez le logiciel ou la fonctionnalité souhaitée...",
        required: true,
        maxLength: 3000,
      },
      {
        id: "projectType",
        type: "select",
        label: "Type de projet",
        required: true,
        options: [
          { value: "new-app", label: "Nouvelle application" },
          { value: "integration", label: "Intégration système" },
          { value: "customization", label: "Personnalisation existante" },
          { value: "api", label: "Développement API" },
          { value: "mobile", label: "Application mobile" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "existingSystem",
        type: "textarea",
        label: "Système existant",
        placeholder: "Décrivez votre environnement actuel et les systèmes à intégrer...",
        helperText: "Logiciels utilisés, versions, contraintes techniques...",
        maxLength: 1500,
      },
      {
        id: "timeline",
        type: "select",
        label: "Délai souhaité",
        options: [
          { value: "urgent", label: "Urgent (< 1 mois)" },
          { value: "3-months", label: "Dans les 3 mois" },
          { value: "6-months", label: "Dans les 6 mois" },
          { value: "flexible", label: "Flexible" },
        ],
      },
      {
        id: "budget",
        type: "select",
        label: "Budget approximatif",
        options: [
          { value: "under-5k", label: "Moins de 5 000 €" },
          { value: "5k-20k", label: "5 000 € - 20 000 €" },
          { value: "20k-50k", label: "20 000 € - 50 000 €" },
          { value: "over-50k", label: "Plus de 50 000 €" },
          { value: "unknown", label: "À définir" },
        ],
      },
      commonFields.contactPhone,
      commonFields.attachments,
    ],
  },
  {
    id: "quote-equipment",
    label: "Demande de prix pour de la fourniture de matériel",
    description: "Obtenez un devis pour du matériel uniquement (sans installation)",
    category: "quote",
    icon: "Package",
    fields: [
      commonFields.title,
      {
        id: "equipmentList",
        type: "textarea",
        label: "Liste du matériel souhaité",
        placeholder: "Listez les équipements souhaités avec quantités...\nEx:\n- 4x Caméra IP 4MP\n- 1x Enregistreur 16 voies\n- 2x Switch PoE",
        required: true,
        maxLength: 2000,
      },
      {
        id: "equipmentCategory",
        type: "multiselect",
        label: "Catégories de matériel",
        required: true,
        options: [
          { value: "cameras", label: "Caméras" },
          { value: "recorders", label: "Enregistreurs" },
          { value: "access-control", label: "Contrôle d'accès" },
          { value: "network", label: "Réseau (switch, câbles)" },
          { value: "accessories", label: "Accessoires" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "deliveryAddress",
        type: "textarea",
        label: "Adresse de livraison",
        placeholder: "Adresse complète de livraison...",
        required: true,
        maxLength: 300,
      },
      {
        id: "urgency",
        type: "radio",
        label: "Urgence",
        options: [
          { value: "urgent", label: "Urgent (livraison rapide)" },
          { value: "normal", label: "Normal" },
          { value: "flexible", label: "Flexible" },
        ],
      },
      commonFields.contactPhone,
    ],
  },

  // ============ TRAINING CATEGORY ============
  {
    id: "training-request",
    label: "Demande de formation",
    description: "Demandez une formation pour vous ou votre équipe",
    category: "training",
    icon: "GraduationCap",
    fields: [
      commonFields.title,
      {
        id: "trainingTopic",
        type: "select",
        label: "Sujet de formation",
        required: true,
        options: [
          { value: "video-surveillance", label: "Utilisation vidéosurveillance" },
          { value: "access-control", label: "Gestion contrôle d'accès" },
          { value: "software-admin", label: "Administration logicielle" },
          { value: "maintenance", label: "Maintenance de base" },
          { value: "security-procedures", label: "Procédures de sécurité" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "trainingDetails",
        type: "textarea",
        label: "Détails de la formation souhaitée",
        placeholder: "Précisez vos besoins de formation...",
        required: true,
        maxLength: 1500,
      },
      {
        id: "participantCount",
        type: "number",
        label: "Nombre de participants",
        required: true,
        placeholder: "Ex: 5",
      },
      {
        id: "participantLevel",
        type: "radio",
        label: "Niveau des participants",
        required: true,
        options: [
          { value: "beginner", label: "Débutant" },
          { value: "intermediate", label: "Intermédiaire" },
          { value: "advanced", label: "Avancé" },
          { value: "mixed", label: "Mixte" },
        ],
      },
      {
        id: "trainingFormat",
        type: "radio",
        label: "Format souhaité",
        required: true,
        options: [
          { value: "onsite", label: "Sur site (dans vos locaux)" },
          { value: "remote", label: "À distance (visioconférence)" },
          { value: "our-premises", label: "Dans nos locaux" },
        ],
      },
      commonFields.site,
      commonFields.preferredDate,
      commonFields.contactPhone,
    ],
  },
  {
    id: "system-evaluation",
    label: "Évaluation du système",
    description: "Demandez une évaluation de votre système de sécurité actuel",
    category: "training",
    icon: "ClipboardCheck",
    fields: [
      commonFields.title,
      {
        id: "evaluationReason",
        type: "select",
        label: "Raison de l'évaluation",
        required: true,
        options: [
          { value: "performance", label: "Problèmes de performance" },
          { value: "upgrade", label: "Envisager une mise à niveau" },
          { value: "compliance", label: "Conformité réglementaire" },
          { value: "security-audit", label: "Audit de sécurité" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "evaluationScope",
        type: "textarea",
        label: "Périmètre de l'évaluation",
        placeholder: "Décrivez ce que vous souhaitez faire évaluer...",
        required: true,
        maxLength: 2000,
      },
      commonFields.site,
      {
        id: "currentSystems",
        type: "multiselect",
        label: "Systèmes installés",
        options: [
          { value: "video-surveillance", label: "Vidéosurveillance" },
          { value: "access-control", label: "Contrôle d'accès" },
          { value: "intercom", label: "Interphone" },
          { value: "alarm", label: "Alarme" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "installationAge",
        type: "select",
        label: "Âge de l'installation",
        options: [
          { value: "under-1y", label: "Moins d'un an" },
          { value: "1-3y", label: "1 à 3 ans" },
          { value: "3-5y", label: "3 à 5 ans" },
          { value: "over-5y", label: "Plus de 5 ans" },
          { value: "unknown", label: "Je ne sais pas" },
        ],
      },
      commonFields.preferredDate,
      commonFields.contactPhone,
      commonFields.attachments,
    ],
  },
  {
    id: "software-customization",
    label: "Personnalisation logicielle",
    description: "Demandez une personnalisation de votre logiciel existant",
    category: "training",
    icon: "Palette",
    fields: [
      commonFields.title,
      {
        id: "softwareName",
        type: "text",
        label: "Logiciel concerné",
        placeholder: "Nom du logiciel à personnaliser",
        required: true,
      },
      {
        id: "customizationDescription",
        type: "textarea",
        label: "Personnalisation souhaitée",
        placeholder: "Décrivez les personnalisations que vous souhaitez...",
        required: true,
        maxLength: 2000,
      },
      {
        id: "currentVersion",
        type: "text",
        label: "Version actuelle",
        placeholder: "Ex: v2.4.1",
      },
      commonFields.priority,
      commonFields.attachments,
    ],
  },

  // ============ OTHER CATEGORY ============
  {
    id: "question-info",
    label: "Question / Information",
    description: "Posez une question ou demandez des informations",
    category: "other",
    icon: "HelpCircle",
    fields: [
      commonFields.title,
      {
        id: "question",
        type: "textarea",
        label: "Votre question",
        placeholder: "Posez votre question ou décrivez l'information recherchée...",
        required: true,
        maxLength: 2000,
      },
      {
        id: "topic",
        type: "select",
        label: "Sujet",
        options: [
          { value: "product", label: "Produit / Matériel" },
          { value: "service", label: "Service / Prestation" },
          { value: "invoice", label: "Facturation" },
          { value: "contract", label: "Contrat" },
          { value: "technical", label: "Technique" },
          { value: "other", label: "Autre" },
        ],
      },
      {
        id: "urgency",
        type: "radio",
        label: "Urgence de la réponse",
        options: [
          { value: "urgent", label: "Urgent" },
          { value: "normal", label: "Normal" },
        ],
      },
      commonFields.contactPhone,
    ],
  },
  {
    id: "software-update",
    label: "Mise à jour logiciel",
    description: "Demandez une mise à jour de votre logiciel",
    category: "other",
    icon: "RefreshCw",
    fields: [
      commonFields.title,
      {
        id: "softwareName",
        type: "text",
        label: "Logiciel à mettre à jour",
        placeholder: "Nom du logiciel",
        required: true,
      },
      {
        id: "currentVersion",
        type: "text",
        label: "Version actuelle",
        placeholder: "Ex: v2.4.1",
        required: true,
      },
      {
        id: "targetVersion",
        type: "text",
        label: "Version souhaitée",
        placeholder: "Ex: v3.0.0 ou 'dernière version'",
      },
      {
        id: "updateReason",
        type: "textarea",
        label: "Raison de la mise à jour",
        placeholder: "Pourquoi souhaitez-vous cette mise à jour ?",
        maxLength: 1000,
      },
      commonFields.site,
      commonFields.preferredDate,
      commonFields.contactPhone,
    ],
  },
  {
    id: "other",
    label: "Autre",
    description: "Pour toute autre demande",
    category: "other",
    icon: "MoreHorizontal",
    fields: [
      commonFields.title,
      commonFields.description,
      commonFields.priority,
      commonFields.attachments,
      commonFields.contactPhone,
    ],
  },
];

// Group request types by category for better UX
export const requestTypesByCategory = {
  support: {
    label: "Support technique",
    description: "Assistance et maintenance",
    types: requestTypes.filter((t) => t.category === "support"),
  },
  quote: {
    label: "Demandes de devis",
    description: "Obtenir un prix",
    types: requestTypes.filter((t) => t.category === "quote"),
  },
  training: {
    label: "Formation & Évaluation",
    description: "Formation et analyse",
    types: requestTypes.filter((t) => t.category === "training"),
  },
  other: {
    label: "Autres demandes",
    description: "Questions et divers",
    types: requestTypes.filter((t) => t.category === "other"),
  },
};
