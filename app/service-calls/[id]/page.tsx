'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, PriorityBadge } from '@/components/service-call/status-badge'
import { TaskSection } from '@/components/service-call/task-section'
import { InvoiceGenerator } from '@/components/invoice/invoice-generator'
import { useData } from '@/context/data-context'
import {
  SERVICE_CALL_STATUS_OPTIONS,
  SERVICE_CALL_TRANSITIONS,
  PRIORITY_OPTIONS,
  ISSUE_TYPE_OPTIONS,
  formatDate,
  formatDateTime,
  formatCurrency,
  INVOICE_STATUS_COLORS,
} from '@/lib/constants'
import { toast } from 'sonner'
import {
  Pencil,
  FileText,
  Calendar,
  User,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  ArrowLeft,
  ChevronRight,
  Building2,
  Phone,
  Mail,
  Wrench,
  ExternalLink,
  Copy,
  TrendingUp,
  ListTodo,
  Receipt,
  Timer,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { ServiceCallStatus, ServiceCallPriority } from '@/lib/types'

export default function ServiceCallDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const {
    getServiceCall,
    updateServiceCall,
    sites,
    customers,
    getTasksForServiceCall,
    timeEntries,
    materialUsages,
    getInvoicesForServiceCall,
  } = useData()

  const serviceCall = getServiceCall(id)
  const site = serviceCall ? sites.find((s) => s.id === serviceCall.siteId) : undefined
  const customer = site ? customers.find((c) => c.id === site.customerId) : undefined
  const serviceTasks = serviceCall ? getTasksForServiceCall(serviceCall.id) : []
  const serviceInvoices = serviceCall ? getInvoicesForServiceCall(serviceCall.id) : []

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<ServiceCallStatus | ''>('')
  const [selectedPriority, setSelectedPriority] = useState<ServiceCallPriority | ''>('')

  if (!serviceCall) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service Calls', href: '/service-calls' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Service Call Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The service call you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button onClick={() => router.push('/service-calls')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service Calls
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== serviceCall.status) {
      updateServiceCall(serviceCall.id, { status: selectedStatus })
      toast.success('Status updated successfully')
      setStatusDialogOpen(false)
      setSelectedStatus('')
    }
  }

  const handlePriorityUpdate = () => {
    if (selectedPriority && selectedPriority !== serviceCall.priority) {
      updateServiceCall(serviceCall.id, { priority: selectedPriority })
      toast.success('Priority updated successfully')
      setPriorityDialogOpen(false)
      setSelectedPriority('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const issueTypeLabel =
    ISSUE_TYPE_OPTIONS.find((opt) => opt.value === serviceCall.issueType)?.label || serviceCall.issueType

  // Calculate time & materials summary
  const taskIds = serviceTasks.map((t) => t.id)
  const relatedTimeEntries = timeEntries.filter((te) => taskIds.includes(te.taskId))
  const relatedMaterials = materialUsages.filter((mu) => taskIds.includes(mu.taskId))

  const totalHours = relatedTimeEntries.reduce((sum, te) => sum + te.hours, 0)
  const totalMaterialCost = relatedMaterials.reduce(
    (sum, mu) => sum + (mu.unitCost || 0) * mu.quantity,
    0
  )

  // Calculate task completion stats
  const completedTasks = serviceTasks.filter((t) => t.status === 'completed').length
  const taskCompletionPercentage = serviceTasks.length > 0
    ? Math.round((completedTasks / serviceTasks.length) * 100)
    : 0

  // Calculate total estimated hours
  const totalEstimatedHours = serviceTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)

  // Calculate total invoiced amount
  const totalInvoicedAmount = serviceInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  // Status flow visualization
  const statusFlow: ServiceCallStatus[] = ['open', 'in_progress', 'resolved', 'invoiced', 'closed']
  const currentStatusIndex = statusFlow.indexOf(serviceCall.status)

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service Calls', href: '/service-calls' },
            { label: serviceCall.id },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(serviceCall.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy ID</TooltipContent>
              </Tooltip>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStatus(serviceCall.status)
                  setStatusDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPriority(serviceCall.priority)
                  setPriorityDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Priority
              </Button>
            </div>
          }
        />

        <div className="flex-1 space-y-6 p-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/50 p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 via-transparent to-transparent" />

            <div className="relative space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                      {serviceCall.id}
                    </code>
                    <span>•</span>
                    <span>{issueTypeLabel}</span>
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">{serviceCall.title}</h1>
                  <p className="text-muted-foreground max-w-2xl">{serviceCall.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={serviceCall.status} className="text-sm px-3 py-1" />
                  <PriorityBadge priority={serviceCall.priority} className="text-sm px-3 py-1" />
                </div>
              </div>

              {/* Status Flow */}
              <div className="pt-4">
                <div className="flex items-center gap-1">
                  {statusFlow.map((status, index) => {
                    const isCompleted = index < currentStatusIndex
                    const isCurrent = index === currentStatusIndex
                    const statusLabel = SERVICE_CALL_STATUS_OPTIONS.find(s => s.value === status)?.label || status

                    return (
                      <div key={status} className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                isCompleted && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                isCurrent && "bg-primary text-primary-foreground shadow-md",
                                !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : isCurrent ? (
                                <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
                              ) : null}
                              <span className="hidden sm:inline">{statusLabel}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{statusLabel}</TooltipContent>
                        </Tooltip>
                        {index < statusFlow.length - 1 && (
                          <ChevronRight className={cn(
                            "h-4 w-4 mx-1",
                            index < currentStatusIndex ? "text-green-500" : "text-muted-foreground/30"
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Tasks Progress</p>
                    <p className="text-2xl font-bold">{completedTasks}/{serviceTasks.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <Progress value={taskCompletionPercentage} className="mt-3 h-2" />
                <p className="text-xs text-muted-foreground mt-2">{taskCompletionPercentage}% complete</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Hours Logged</p>
                    <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                {totalEstimatedHours > 0 && (
                  <>
                    <Progress
                      value={Math.min((totalHours / totalEstimatedHours) * 100, 100)}
                      className="mt-3 h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      of {totalEstimatedHours}h estimated
                    </p>
                  </>
                )}
                {totalEstimatedHours === 0 && (
                  <p className="text-xs text-muted-foreground mt-5">No estimate set</p>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Material Costs</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalMaterialCost)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <Package className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-5">
                  {relatedMaterials.length} material{relatedMaterials.length !== 1 ? 's' : ''} used
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Invoiced</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalInvoicedAmount)}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-5">
                  {serviceInvoices.length} invoice{serviceInvoices.length !== 1 ? 's' : ''} generated
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-12 p-1 bg-muted/50">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2 data-[state=active]:shadow-sm">
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks</span>
                {serviceTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {serviceTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="time-materials" className="gap-2 data-[state=active]:shadow-sm">
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline">Time & Materials</span>
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-2 data-[state=active]:shadow-sm">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Invoices</span>
                {serviceInvoices.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {serviceInvoices.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Service Call Details */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wrench className="h-5 w-5 text-muted-foreground" />
                      Service Call Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Service Call ID
                        </Label>
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                            {serviceCall.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyToClipboard(serviceCall.id)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Issue Type
                        </Label>
                        <p className="text-sm font-medium">{issueTypeLabel}</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Created
                        </Label>
                        <p className="text-sm">{formatDateTime(serviceCall.createdAt)}</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                          Last Updated
                        </Label>
                        <p className="text-sm">{formatDateTime(serviceCall.updatedAt)}</p>
                      </div>
                    </div>

                    {serviceCall.equipmentType && (
                      <>
                        <Separator />
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                            Equipment Type
                          </Label>
                          <p className="text-sm font-medium">{serviceCall.equipmentType}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Site & Customer Information */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      Site & Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {site ? (
                      <>
                        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{site.name}</p>
                              <p className="text-sm text-muted-foreground">{site.address}</p>
                            </div>
                          </div>
                        </div>

                        {customer && (
                          <div className="space-y-3">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                              Customer
                            </Label>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  {customer.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {customer.email}
                                    </span>
                                  )}
                                  {customer.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {customer.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground">Site information not available</p>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Requester
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{serviceCall.requesterName}</p>
                          {serviceCall.requesterContact && (
                            <p className="text-sm text-muted-foreground">{serviceCall.requesterContact}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <TaskSection serviceCallId={serviceCall.id} />
            </TabsContent>

            <TabsContent value="time-materials" className="space-y-6 mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ListTodo className="h-4 w-4" />
                      Total Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{serviceTasks.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {completedTasks} completed
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Total Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalHours.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {relatedTimeEntries.length} time entries
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Material Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(totalMaterialCost)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {relatedMaterials.length} materials
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Time & Materials Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of all billable time and materials for this service call
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">Time Entries</h4>
                            <p className="text-sm text-muted-foreground">
                              {relatedTimeEntries.length} entries logged
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{totalHours.toFixed(2)}h</p>
                          <p className="text-xs text-muted-foreground">Total billable</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">Materials</h4>
                            <p className="text-sm text-muted-foreground">
                              {relatedMaterials.length} items used
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{formatCurrency(totalMaterialCost)}</p>
                          <p className="text-xs text-muted-foreground">Total cost</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Invoices
                    </CardTitle>
                    <CardDescription>
                      Invoices generated for this service call
                    </CardDescription>
                  </div>
                  <InvoiceGenerator serviceCallId={serviceCall.id} />
                </CardHeader>
                <CardContent>
                  {serviceInvoices.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">No invoices yet</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        Generate an invoice when you're ready to bill for completed work
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Invoice Number</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold">Issued Date</TableHead>
                            <TableHead className="font-semibold">Due Date</TableHead>
                            <TableHead className="font-semibold text-right">Amount</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceInvoices.map((invoice) => (
                            <TableRow key={invoice.id} className="group">
                              <TableCell>
                                <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                                  {invoice.invoiceNumber}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatDate(invoice.issuedDate)}</TableCell>
                              <TableCell className="text-sm">{formatDate(invoice.dueDate)}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(invoice.totalAmount)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => router.push(`/invoices/${invoice.id}`)}
                                >
                                  View
                                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
              <DialogDescription>
                Change the status of this service call
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Current Status
                </Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <StatusBadge status={serviceCall.status} />
                  <span className="text-sm text-muted-foreground">Current state</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="status" className="text-xs text-muted-foreground uppercase tracking-wide">
                  New Status
                </Label>
                {SERVICE_CALL_TRANSITIONS[serviceCall.status].length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    This service call is in a terminal state and cannot be changed.
                  </p>
                ) : (
                  <Select
                    value={selectedStatus}
                    onValueChange={(value) => setSelectedStatus(value as ServiceCallStatus)}
                  >
                    <SelectTrigger id="status" className="h-11">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CALL_STATUS_OPTIONS
                        .filter((option) =>
                          option.value === serviceCall.status ||
                          SERVICE_CALL_TRANSITIONS[serviceCall.status].includes(option.value)
                        )
                        .map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.value === serviceCall.status}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={SERVICE_CALL_TRANSITIONS[serviceCall.status].length === 0}
              >
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Priority Update Dialog */}
        <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Priority</DialogTitle>
              <DialogDescription>
                Change the priority level of this service call
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Current Priority
                </Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <PriorityBadge priority={serviceCall.priority} />
                  <span className="text-sm text-muted-foreground">Current level</span>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="priority" className="text-xs text-muted-foreground uppercase tracking-wide">
                  New Priority
                </Label>
                <Select
                  value={selectedPriority}
                  onValueChange={(value) => setSelectedPriority(value as ServiceCallPriority)}
                >
                  <SelectTrigger id="priority" className="h-11">
                    <SelectValue placeholder="Select new priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePriorityUpdate}>Update Priority</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
