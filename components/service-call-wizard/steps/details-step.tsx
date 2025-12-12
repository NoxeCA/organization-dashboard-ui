'use client'

import {
  FileText,
  User,
  Phone,
  Tags,
  Wrench,
  AlertCircle,
  Zap,
  Info,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PRIORITY_OPTIONS, ISSUE_TYPE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ServiceCallPriority, IssueType } from '@/lib/types'

export interface DetailsFormData {
  title: string
  description: string
  priority: ServiceCallPriority
  requesterName: string
  requesterContact: string
  issueType: IssueType
  equipmentType: string
}

interface DetailsStepProps {
  formData: DetailsFormData
  onFormChange: (data: Partial<DetailsFormData>) => void
  onNext: () => void
  onBack: () => void
}

const priorityConfig = {
  low: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: null },
  medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: null },
  high: {
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertCircle,
  },
  critical: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: Zap,
  },
}

export function DetailsStep({ formData, onFormChange, onNext, onBack }: DetailsStepProps) {
  const isValid =
    formData.title.length >= 5 &&
    formData.description.length >= 10 &&
    formData.priority &&
    formData.requesterName.length >= 2 &&
    formData.issueType

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Provide the essential details about the service call</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Title
                <Badge variant="secondary" className="text-xs font-normal">
                  Required
                </Badge>
              </label>
              <Input
                placeholder="Brief description of the issue (e.g., Network outage at main office)"
                value={formData.title}
                onChange={(e) => onFormChange({ title: e.target.value })}
                className="h-11"
              />
              {formData.title.length > 0 && formData.title.length < 5 && (
                <p className="text-sm text-destructive">Title must be at least 5 characters</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Description
                <Badge variant="secondary" className="text-xs font-normal">
                  Required
                </Badge>
              </label>
              <Textarea
                placeholder="Detailed description of the issue or request. Include any relevant information that will help technicians understand the problem."
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                className="min-h-[120px] resize-none"
              />
              <div className="flex items-center justify-between">
                {formData.description.length > 0 && formData.description.length < 10 && (
                  <p className="text-sm text-destructive">Description must be at least 10 characters</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formData.description.length} characters
                </span>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Priority Level
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Priority determines response time:</p>
                    <ul className="mt-1 text-xs space-y-1">
                      <li>
                        <strong>Critical:</strong> Immediate response
                      </li>
                      <li>
                        <strong>High:</strong> Within 4 hours
                      </li>
                      <li>
                        <strong>Medium:</strong> Within 24 hours
                      </li>
                      <li>
                        <strong>Low:</strong> Within 48 hours
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRIORITY_OPTIONS.map((option) => {
                  const config = priorityConfig[option.value as keyof typeof priorityConfig]
                  const Icon = config.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onFormChange({ priority: option.value as ServiceCallPriority })}
                      className={cn(
                        'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                        formData.priority === option.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-muted hover:border-muted-foreground/50'
                      )}
                    >
                      {formData.priority === option.value && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className={cn('rounded-full px-3 py-1 text-xs font-medium', config.color)}>
                        {Icon && <Icon className="h-3 w-3 inline mr-1" />}
                        {option.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Contact Information</CardTitle>
                <CardDescription>Who is requesting this service?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Requester Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Requester Name
                  <Badge variant="secondary" className="text-xs font-normal">
                    Required
                  </Badge>
                </label>
                <Input
                  placeholder="Name of the person requesting service"
                  value={formData.requesterName}
                  onChange={(e) => onFormChange({ requesterName: e.target.value })}
                  className="h-11"
                />
                {formData.requesterName.length > 0 && formData.requesterName.length < 2 && (
                  <p className="text-sm text-destructive">Name must be at least 2 characters</p>
                )}
              </div>

              {/* Requester Contact */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Contact Information
                  <Badge variant="outline" className="text-xs font-normal">
                    Optional
                  </Badge>
                </label>
                <Input
                  placeholder="Email or phone number"
                  value={formData.requesterContact}
                  onChange={(e) => onFormChange({ requesterContact: e.target.value })}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">For follow-up questions about this request</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Tags className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Classification</CardTitle>
                <CardDescription>Categorize the type of issue and equipment involved</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Issue Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Issue Type
                <Badge variant="secondary" className="text-xs font-normal">
                  Required
                </Badge>
              </label>
              <Select
                value={formData.issueType}
                onValueChange={(value) => onFormChange({ issueType: value as IssueType })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select the type of issue" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                Equipment Type
                <Badge variant="outline" className="text-xs font-normal">
                  Optional
                </Badge>
              </label>
              <Input
                placeholder="e.g., IP Camera, Access Control Panel, HVAC System"
                value={formData.equipmentType}
                onChange={(e) => onFormChange({ equipmentType: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Specific equipment or system affected by the issue
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            Back
          </Button>
          <Button onClick={onNext} disabled={!isValid} size="lg">
            Continue to Review
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
