'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  FileText,
  AlertTriangle,
  Package,
  Wrench,
  HelpCircle,
  MessageSquare,
  Check,
  ChevronRight,
  Send,
  Sparkles,
  Plus,
  ListChecks,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  type RequestType,
  type ServiceCallFormData,
  type ProblemEntry,
  type EquipmentCategory,
  REQUEST_TYPES,
  EQUIPMENT_CATEGORIES,
  SERVICE_TYPES,
  BUDGET_RANGES,
  URGENCY_LEVELS,
  FIELD_VISIBILITY,
  getInitialFormData,
  getInitialFormDataForType,
  createProblemEntry,
  supportsMultipleProblems,
  validateProblemEntry,
} from './form-config'
import { ProblemEntryCard } from './problem-entry-card'

const iconMap = {
  FileText,
  AlertTriangle,
  Package,
  Wrench,
  HelpCircle,
  MessageSquare,
}

export function ServiceCallForm() {
  const [formData, setFormData] = useState<Partial<ServiceCallFormData>>(getInitialFormData())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = useCallback(<K extends keyof ServiceCallFormData>(
    field: K,
    value: ServiceCallFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleRequestTypeChange = useCallback((type: RequestType) => {
    setFormData(getInitialFormDataForType(type))
  }, [])

  // Problem entry handlers
  const addProblem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      problems: [...(prev.problems || []), createProblemEntry()],
    }))
  }, [])

  const removeProblem = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      problems: (prev.problems || []).filter(p => p.id !== id),
    }))
  }, [])

  const updateProblem = useCallback((id: string, updates: Partial<ProblemEntry>) => {
    setFormData(prev => ({
      ...prev,
      problems: (prev.problems || []).map(p =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }))
  }, [])

  const handleSubmit = async () => {
    if (!formData.requestType) return

    // Validate based on request type
    if (supportsMultipleProblems(formData.requestType)) {
      const problems = formData.problems || []
      if (problems.length === 0) {
        toast.error('Please add at least one item')
        return
      }

      // Validate each problem
      for (let i = 0; i < problems.length; i++) {
        const missing = validateProblemEntry(problems[i], formData.requestType)
        if (missing.length > 0) {
          toast.error(`Problem #${i + 1} is incomplete`, {
            description: `Missing: ${missing.join(', ')}`,
          })
          return
        }
      }
    } else {
      // Validate other request types
      if (formData.requestType === 'quote' && (!formData.serviceType || !formData.projectDescription)) {
        toast.error('Please fill in all required fields')
        return
      }
      if (formData.requestType === 'installation' && (!formData.equipmentCategory || !formData.installationScope)) {
        toast.error('Please fill in all required fields')
        return
      }
      if (formData.requestType === 'general' && (!formData.subject || !formData.message)) {
        toast.error('Please fill in all required fields')
        return
      }
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const taskCount = supportsMultipleProblems(formData.requestType)
      ? (formData.problems?.length || 0)
      : 1

    toast.success('Service request submitted successfully!', {
      description: `${taskCount} task${taskCount > 1 ? 's' : ''} will be created.`,
    })

    // Reset form
    setFormData(getInitialFormData())
    setIsSubmitting(false)
  }

  const visibility = formData.requestType ? FIELD_VISIBILITY[formData.requestType] : null
  const isMultiProblemType = formData.requestType && supportsMultipleProblems(formData.requestType)
  const problemCount = formData.problems?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/50 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 via-transparent to-transparent" />
        <div className="relative flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Submit a Service Request</h1>
            <p className="text-muted-foreground">
              Tell us what you need and we&apos;ll get back to you promptly
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Request Type Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              1
            </div>
            <div>
              <CardTitle className="text-lg">What can we help you with?</CardTitle>
              <CardDescription>Select the type of request that best describes your needs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REQUEST_TYPES.map((type) => {
              const Icon = iconMap[type.icon as keyof typeof iconMap]
              const isSelected = formData.requestType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleRequestTypeChange(type.value)}
                  className={cn(
                    'relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all hover:bg-accent/50',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  )}>
                    <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Show remaining sections only after request type is selected */}
      {formData.requestType && (
        <>
          {/* Step 2: Dynamic Fields Based on Request Type */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {formData.requestType === 'quote' && 'Quote Details'}
                      {formData.requestType === 'equipment_issue' && 'Problems to Report'}
                      {formData.requestType === 'installation' && 'Installation Details'}
                      {formData.requestType === 'maintenance' && 'Equipment for Maintenance'}
                      {formData.requestType === 'support' && 'Support Issues'}
                      {formData.requestType === 'general' && 'Your Message'}
                    </CardTitle>
                    <CardDescription>
                      {formData.requestType === 'quote' && 'Tell us about the services you need'}
                      {formData.requestType === 'equipment_issue' && 'Add each problem as a separate entry - each will create a task'}
                      {formData.requestType === 'installation' && 'Describe your installation needs'}
                      {formData.requestType === 'maintenance' && 'Add equipment that needs maintenance - each will create a task'}
                      {formData.requestType === 'support' && 'Describe your issues - each will create a task'}
                      {formData.requestType === 'general' && 'How can we help you?'}
                    </CardDescription>
                  </div>
                </div>
                {isMultiProblemType && problemCount > 0 && (
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="secondary">
                      {problemCount} {problemCount === 1 ? 'task' : 'tasks'} will be created
                    </Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Multi-problem types (equipment_issue, maintenance, support) */}
              {isMultiProblemType && (
                <>
                  <div className="space-y-4">
                    {(formData.problems || []).map((problem, index) => (
                      <ProblemEntryCard
                        key={problem.id}
                        entry={problem}
                        index={index}
                        requestType={formData.requestType!}
                        canDelete={problemCount > 1}
                        onUpdate={updateProblem}
                        onDelete={removeProblem}
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProblem}
                    className="w-full gap-2 border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another {formData.requestType === 'equipment_issue' ? 'Problem' : formData.requestType === 'maintenance' ? 'Equipment' : 'Issue'}
                  </Button>

                  {/* Service contract section for maintenance */}
                  {formData.requestType === 'maintenance' && (
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="contract"
                          checked={formData.hasServiceContract ?? false}
                          onCheckedChange={(checked) => updateField('hasServiceContract', checked as boolean)}
                        />
                        <Label htmlFor="contract" className="font-normal cursor-pointer">
                          I have an active service contract
                        </Label>
                      </div>

                      {formData.hasServiceContract && (
                        <div className="space-y-2 ml-6">
                          <Label>Contract Number</Label>
                          <Input
                            placeholder="Enter your contract number"
                            value={formData.contractNumber || ''}
                            onChange={(e) => updateField('contractNumber', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Quote Fields */}
              {visibility?.showQuoteFields && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        Service Type
                        <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                      </Label>
                      <Select
                        value={formData.serviceType || ''}
                        onValueChange={(value) => updateField('serviceType', value as typeof formData.serviceType)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Budget Range</Label>
                      <Select
                        value={formData.budgetRange || ''}
                        onValueChange={(value) => updateField('budgetRange', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUDGET_RANGES.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Project Description
                      <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                    </Label>
                    <Textarea
                      placeholder="Describe your project requirements, goals, and any specific needs..."
                      value={formData.projectDescription || ''}
                      onChange={(e) => updateField('projectDescription', e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Timeline</Label>
                    <Input
                      placeholder="e.g., Within 2 weeks, Q1 2025, ASAP"
                      value={formData.preferredTimeline || ''}
                      onChange={(e) => updateField('preferredTimeline', e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Installation Fields */}
              {visibility?.showInstallationFields && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>
                        Equipment Category
                        <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                      </Label>
                      <Select
                        value={formData.equipmentCategory || ''}
                        onValueChange={(value) => updateField('equipmentCategory', value as EquipmentCategory)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment type" />
                        </SelectTrigger>
                        <SelectContent>
                          {EQUIPMENT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Installation Scope
                      <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                    </Label>
                    <Textarea
                      placeholder="Describe what you want installed, quantity, and specific requirements..."
                      value={formData.installationScope || ''}
                      onChange={(e) => updateField('installationScope', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Site Readiness</Label>
                    <Textarea
                      placeholder="Is the site ready for installation? Any electrical, network, or structural considerations?"
                      value={formData.siteReadiness || ''}
                      onChange={(e) => updateField('siteReadiness', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </>
              )}

              {/* General Fields */}
              {visibility?.showGeneralFields && (
                <>
                  <div className="space-y-2">
                    <Label>
                      Subject
                      <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                    </Label>
                    <Input
                      placeholder="Brief subject of your inquiry"
                      value={formData.subject || ''}
                      onChange={(e) => updateField('subject', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Message
                      <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                    </Label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={formData.message || ''}
                      onChange={(e) => updateField('message', e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Urgency */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  3
                </div>
                <div>
                  <CardTitle className="text-lg">How urgent is this request?</CardTitle>
                  <CardDescription>This helps us prioritize and respond appropriately</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {URGENCY_LEVELS.map((level) => {
                  const isSelected = formData.urgency === level.value
                  const urgencyColors = {
                    low: 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600',
                    medium: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700',
                    high: 'bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700',
                    critical: 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700',
                  }
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateField('urgency', level.value)}
                      className={cn(
                        'relative flex flex-col items-center gap-1 rounded-lg border-2 p-4 text-center transition-all',
                        isSelected
                          ? `${urgencyColors[level.value]} border-primary shadow-sm`
                          : 'border-muted hover:border-muted-foreground/50'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <p className="font-medium capitalize">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setFormData(getInitialFormData())}
              disabled={isSubmitting}
            >
              Clear Form
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </span>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  {isMultiProblemType && problemCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {problemCount}
                    </Badge>
                  )}
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* CTA when no request type selected */}
      {!formData.requestType && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <ChevronRight className="h-5 w-5 animate-pulse" />
            <span>Select a request type above to continue</span>
          </div>
        </div>
      )}
    </div>
  )
}
