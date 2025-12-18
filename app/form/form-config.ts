import type { ServiceCallPriority } from '@/lib/types'

// Request Types - The primary driver for dynamic fields
export type RequestType =
  | 'quote'           // Ask for a quote/pricing
  | 'equipment_issue' // Report equipment problem
  | 'installation'    // Request new installation
  | 'maintenance'     // Scheduled/preventive maintenance
  | 'support'         // Technical support/assistance
  | 'general'         // General inquiry

export const REQUEST_TYPES: {
  value: RequestType
  label: string
  description: string
  icon: string
}[] = [
  {
    value: 'quote',
    label: 'Request a Quote',
    description: 'Get pricing for services or equipment',
    icon: 'FileText',
  },
  {
    value: 'equipment_issue',
    label: 'Equipment Problem',
    description: 'Report a malfunction or issue with equipment',
    icon: 'AlertTriangle',
  },
  {
    value: 'installation',
    label: 'New Installation',
    description: 'Request installation of new equipment or system',
    icon: 'Package',
  },
  {
    value: 'maintenance',
    label: 'Maintenance Request',
    description: 'Schedule preventive or routine maintenance',
    icon: 'Wrench',
  },
  {
    value: 'support',
    label: 'Technical Support',
    description: 'Get help with technical issues or questions',
    icon: 'HelpCircle',
  },
  {
    value: 'general',
    label: 'General Inquiry',
    description: 'Other questions or requests',
    icon: 'MessageSquare',
  },
]

// Equipment Categories
export const EQUIPMENT_CATEGORIES = [
  { value: 'security_camera', label: 'Security Camera / CCTV' },
  { value: 'access_control', label: 'Access Control System' },
  { value: 'alarm_system', label: 'Alarm System' },
  { value: 'intercom', label: 'Intercom / Video Entry' },
  { value: 'network', label: 'Network Equipment' },
  { value: 'hvac', label: 'HVAC System' },
  { value: 'fire_safety', label: 'Fire Safety System' },
  { value: 'lighting', label: 'Smart Lighting' },
  { value: 'audio_video', label: 'Audio/Video System' },
  { value: 'other', label: 'Other Equipment' },
] as const

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number]['value']

// Problem Types (for equipment issues)
export const PROBLEM_TYPES = [
  { value: 'not_working', label: 'Not Working / No Power' },
  { value: 'intermittent', label: 'Intermittent Issues' },
  { value: 'poor_quality', label: 'Poor Quality / Performance' },
  { value: 'error_message', label: 'Error Messages / Alerts' },
  { value: 'physical_damage', label: 'Physical Damage' },
  { value: 'connectivity', label: 'Connectivity Problems' },
  { value: 'configuration', label: 'Configuration Issues' },
  { value: 'unknown', label: 'Unknown / Not Sure' },
] as const

export type ProblemType = typeof PROBLEM_TYPES[number]['value']

// Problem Entry - represents a single problem/issue that will become a Task
export interface ProblemEntry {
  id: string
  equipmentCategory?: EquipmentCategory
  equipmentModel?: string
  problemType?: ProblemType
  problemDescription?: string
  whenStarted?: string
  isEquipmentAccessible?: boolean
  // For support
  errorMessages?: string
  stepsTriedDescription?: string
  remoteAccessAvailable?: boolean
  // For maintenance
  maintenanceType?: MaintenanceType
  lastServiceDate?: string
}

// Helper to create a new empty problem entry
export function createProblemEntry(): ProblemEntry {
  return {
    id: crypto.randomUUID(),
    isEquipmentAccessible: true,
  }
}

// Request types that support multiple problems (each becomes a Task)
export const MULTI_PROBLEM_REQUEST_TYPES: RequestType[] = ['equipment_issue', 'support', 'maintenance']

// Check if request type supports multiple problems
export function supportsMultipleProblems(requestType: RequestType): boolean {
  return MULTI_PROBLEM_REQUEST_TYPES.includes(requestType)
}

// Service Types (for quotes)
export const SERVICE_TYPES = [
  { value: 'new_system', label: 'New System Installation' },
  { value: 'upgrade', label: 'System Upgrade' },
  { value: 'expansion', label: 'System Expansion' },
  { value: 'replacement', label: 'Equipment Replacement' },
  { value: 'consultation', label: 'Consultation / Assessment' },
  { value: 'service_contract', label: 'Service Contract' },
] as const

export type ServiceType = typeof SERVICE_TYPES[number]['value']

// Maintenance Types
export const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive Maintenance' },
  { value: 'inspection', label: 'System Inspection' },
  { value: 'cleaning', label: 'Cleaning / Filter Replacement' },
  { value: 'calibration', label: 'Calibration / Testing' },
  { value: 'firmware_update', label: 'Firmware / Software Update' },
  { value: 'contract_visit', label: 'Scheduled Contract Visit' },
] as const

export type MaintenanceType = typeof MAINTENANCE_TYPES[number]['value']

// Urgency Levels
export const URGENCY_LEVELS = [
  { value: 'low', label: 'Low', description: 'No rush, flexible timing' },
  { value: 'medium', label: 'Medium', description: 'Within a week' },
  { value: 'high', label: 'High', description: 'Within 24-48 hours' },
  { value: 'critical', label: 'Critical', description: 'Immediate attention needed' },
] as const

// Budget Ranges (for quotes)
export const BUDGET_RANGES = [
  { value: 'under_1k', label: 'Under $1,000' },
  { value: '1k_5k', label: '$1,000 - $5,000' },
  { value: '5k_10k', label: '$5,000 - $10,000' },
  { value: '10k_25k', label: '$10,000 - $25,000' },
  { value: '25k_plus', label: '$25,000+' },
  { value: 'unsure', label: 'Not Sure / Need Guidance' },
] as const

// Form Data Interface - combines all possible fields
export interface ServiceCallFormData {
  // Always required
  requestType: RequestType

  // Priority/Urgency
  urgency: ServiceCallPriority

  // Multiple problems/tasks (for equipment_issue, support, maintenance)
  // Each problem entry will create a separate Task
  problems: ProblemEntry[]

  // Quote specific
  serviceType?: ServiceType
  budgetRange?: string
  projectDescription?: string
  preferredTimeline?: string

  // Installation specific
  installationType?: string
  installationScope?: string
  siteReadiness?: string
  equipmentCategory?: EquipmentCategory

  // Maintenance specific (shared across all problems)
  hasServiceContract?: boolean
  contractNumber?: string

  // General
  subject?: string
  message?: string

  // Attachments
  attachments?: File[]
}

// Field visibility configuration per request type
export const FIELD_VISIBILITY: Record<RequestType, {
  showEquipmentFields: boolean
  showProblemFields: boolean
  showQuoteFields: boolean
  showMaintenanceFields: boolean
  showSupportFields: boolean
  showInstallationFields: boolean
  showGeneralFields: boolean
}> = {
  quote: {
    showEquipmentFields: false,
    showProblemFields: false,
    showQuoteFields: true,
    showMaintenanceFields: false,
    showSupportFields: false,
    showInstallationFields: false,
    showGeneralFields: false,
  },
  equipment_issue: {
    showEquipmentFields: true,
    showProblemFields: true,
    showQuoteFields: false,
    showMaintenanceFields: false,
    showSupportFields: false,
    showInstallationFields: false,
    showGeneralFields: false,
  },
  installation: {
    showEquipmentFields: true,
    showProblemFields: false,
    showQuoteFields: false,
    showMaintenanceFields: false,
    showSupportFields: false,
    showInstallationFields: true,
    showGeneralFields: false,
  },
  maintenance: {
    showEquipmentFields: true,
    showProblemFields: false,
    showQuoteFields: false,
    showMaintenanceFields: true,
    showSupportFields: false,
    showInstallationFields: false,
    showGeneralFields: false,
  },
  support: {
    showEquipmentFields: true,
    showProblemFields: false,
    showQuoteFields: false,
    showMaintenanceFields: false,
    showSupportFields: true,
    showInstallationFields: false,
    showGeneralFields: false,
  },
  general: {
    showEquipmentFields: false,
    showProblemFields: false,
    showQuoteFields: false,
    showMaintenanceFields: false,
    showSupportFields: false,
    showInstallationFields: false,
    showGeneralFields: true,
  },
}

// Helper to get initial form data
export function getInitialFormData(): Partial<ServiceCallFormData> {
  return {
    requestType: undefined,
    urgency: 'medium',
    problems: [],
  }
}

// Get initial form data with one problem entry for multi-problem types
export function getInitialFormDataForType(requestType: RequestType): Partial<ServiceCallFormData> {
  const base = getInitialFormData()
  base.requestType = requestType

  if (supportsMultipleProblems(requestType)) {
    base.problems = [createProblemEntry()]
  }

  return base
}

// Validation rules per request type
export function getRequiredFields(requestType: RequestType): (keyof ServiceCallFormData)[] {
  const baseFields: (keyof ServiceCallFormData)[] = ['requestType', 'urgency']

  switch (requestType) {
    case 'quote':
      return [...baseFields, 'serviceType', 'projectDescription']
    case 'equipment_issue':
    case 'maintenance':
    case 'support':
      return [...baseFields, 'problems'] // Problems are validated separately
    case 'installation':
      return [...baseFields, 'equipmentCategory', 'installationScope']
    case 'general':
      return [...baseFields, 'subject', 'message']
    default:
      return baseFields
  }
}

// Required fields for each problem entry based on request type
export function getRequiredProblemFields(requestType: RequestType): (keyof ProblemEntry)[] {
  switch (requestType) {
    case 'equipment_issue':
      return ['equipmentCategory', 'problemType', 'problemDescription']
    case 'maintenance':
      return ['equipmentCategory', 'maintenanceType']
    case 'support':
      return ['equipmentCategory', 'problemDescription']
    default:
      return []
  }
}

// Validate a single problem entry
export function validateProblemEntry(problem: ProblemEntry, requestType: RequestType): string[] {
  const requiredFields = getRequiredProblemFields(requestType)
  const missing: string[] = []

  for (const field of requiredFields) {
    if (!problem[field]) {
      missing.push(field)
    }
  }

  return missing
}
