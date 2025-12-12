'use client'

import {
  Building2,
  MapPin,
  FileText,
  User,
  Phone,
  Tags,
  Wrench,
  CreditCard,
  AlertCircle,
  Zap,
  Loader2,
  ArrowRight,
  Pencil,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useData } from '@/context/data-context'
import { cn } from '@/lib/utils'
import type { ServiceCallSite, ServiceCallPriority, IssueType } from '@/lib/types'
import type { WizardStep } from '../wizard-progress'

interface ReviewStepProps {
  customerId: string
  sites: ServiceCallSite[]
  title: string
  description: string
  priority: ServiceCallPriority
  requesterName: string
  requesterContact: string
  issueType: IssueType
  equipmentType: string
  onEdit: (step: WizardStep) => void
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
}

const priorityConfig: Record<
  ServiceCallPriority,
  { label: string; color: string; icon: React.ElementType | null }
> = {
  low: {
    label: 'Low',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: null,
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: null,
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertCircle,
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: Zap,
  },
}

const issueTypeLabels: Record<IssueType, string> = {
  network: 'Network',
  hardware: 'Hardware',
  software: 'Software',
  installation: 'Installation',
  maintenance: 'Maintenance',
  other: 'Other',
}

export function ReviewStep({
  customerId,
  sites: selectedSites,
  title,
  description,
  priority,
  requesterName,
  requesterContact,
  issueType,
  equipmentType,
  onEdit,
  onSubmit,
  onBack,
  isSubmitting,
}: ReviewStepProps) {
  const { customers, sites } = useData()

  const customer = customers.find((c) => c.id === customerId)
  const mainSite = selectedSites.find((s) => s.isMainBillingSite)
  const mainSiteData = mainSite ? sites.find((s) => s.id === mainSite.siteId) : null
  const priorityInfo = priorityConfig[priority]
  const PriorityIcon = priorityInfo.icon

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <CardTitle>Review Service Call</CardTitle>
              <CardDescription>Please review all details before creating the service call</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Customer
              </h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit('customer')}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium">{customer?.name}</p>
              <p className="text-sm text-muted-foreground">{customer?.email}</p>
              <p className="text-sm text-muted-foreground">{customer?.phone}</p>
            </div>
          </div>

          <Separator />

          {/* Sites Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Sites ({selectedSites.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit('sites')}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-2">
              {selectedSites.map((selection) => {
                const site = sites.find((s) => s.id === selection.siteId)
                return (
                  <div
                    key={selection.siteId}
                    className={cn(
                      'p-4 rounded-lg',
                      selection.isMainBillingSite
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{site?.name}</p>
                      {selection.isMainBillingSite && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CreditCard className="h-3 w-3 mr-1" />
                          Main Billing
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{site?.address}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Details Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Service Call Details
              </h3>
              <Button variant="ghost" size="sm" onClick={() => onEdit('details')}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-4">
              {/* Title */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Title</p>
                <p className="font-medium mt-1">{title}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Description</p>
                <p className="text-sm mt-1 whitespace-pre-wrap">{description}</p>
              </div>

              {/* Priority & Issue Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Priority</p>
                  <div className="mt-1">
                    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium', priorityInfo.color)}>
                      {PriorityIcon && <PriorityIcon className="h-3 w-3 mr-1" />}
                      {priorityInfo.label}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Issue Type</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    <span>{issueTypeLabels[issueType]}</span>
                  </div>
                </div>
              </div>

              {/* Equipment Type (if provided) */}
              {equipmentType && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Equipment Type</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>{equipmentType}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Contact Section */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Requester Information
            </h3>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                  <p className="font-medium mt-1">{requesterName}</p>
                </div>
                {requesterContact && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{requesterContact}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium">Ready to Create</p>
              <p className="text-sm text-muted-foreground">
                Service call for {customer?.name} at{' '}
                {selectedSites.length} site{selectedSites.length !== 1 ? 's' : ''}
                {mainSiteData && (
                  <span> (billing to {mainSiteData.name})</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg" disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} size="lg" disabled={isSubmitting} className="min-w-[180px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create Service Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
