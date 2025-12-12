'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { TaskGroupSection } from '@/components/task-group'
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

        <div className="flex-1 space-y-4 p-4">
          {/* Compact Header */}
          <div className="rounded-lg border bg-card">
            <div className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {serviceCall.id}
                    </code>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-xs text-muted-foreground">{issueTypeLabel}</span>
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                      <StatusBadge status={serviceCall.status} className="text-xs" />
                      <PriorityBadge priority={serviceCall.priority} className="text-xs" />
                    </div>
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight truncate">{serviceCall.title}</h1>
                  <p className="text-sm text-muted-foreground line-clamp-2">{serviceCall.description}</p>
                </div>
              </div>
            </div>

            {/* Quick Info Bar - Site & Customer */}
            <div className="border-t bg-muted/30 px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {site ? (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate">{site.name}</span>
                      <span className="text-xs text-muted-foreground hidden md:inline truncate">{site.address}</span>
                    </div>
                    {customer && (
                      <>
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{customer.name}</span>
                          {customer.phone && (
                            <span className="text-xs text-muted-foreground hidden lg:flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No site assigned</span>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{serviceCall.requesterName}</span>
                  {serviceCall.requesterContact && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">({serviceCall.requesterContact})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Stats Bar */}
            <div className="border-t px-4 py-2.5">
              <div className="flex items-center gap-6 overflow-x-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded bg-primary/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-sm">{completedTasks}/{serviceTasks.length}</span>
                        <span className="text-xs text-muted-foreground">tasks</span>
                      </div>
                      {serviceTasks.length > 0 && (
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${taskCompletionPercentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{taskCompletionPercentage}% complete</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-5" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded bg-blue-500/10">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-sm">{totalHours.toFixed(1)}h</span>
                        {totalEstimatedHours > 0 && (
                          <span className="text-xs text-muted-foreground">/ {totalEstimatedHours}h</span>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{relatedTimeEntries.length} time entries logged</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-5" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded bg-orange-500/10">
                        <Package className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-sm">{formatCurrency(totalMaterialCost)}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">({relatedMaterials.length})</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{relatedMaterials.length} materials used</TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-5" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center justify-center h-6 w-6 rounded bg-green-500/10">
                        <DollarSign className="h-3.5 w-3.5 text-green-500" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-sm">{formatCurrency(totalInvoicedAmount)}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">({serviceInvoices.length})</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{serviceInvoices.length} invoices generated</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="tasks" className="space-y-4">
            <TabsList className="h-9 p-0.5 bg-muted/50">
              <TabsTrigger value="tasks" className="gap-1.5 text-xs h-8 px-3 data-[state=active]:shadow-sm">
                <ListTodo className="h-3.5 w-3.5" />
                Tasks
                {serviceTasks.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {serviceTasks.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="time-materials" className="gap-1.5 text-xs h-8 px-3 data-[state=active]:shadow-sm">
                <Timer className="h-3.5 w-3.5" />
                Time & Materials
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-1.5 text-xs h-8 px-3 data-[state=active]:shadow-sm">
                <Receipt className="h-3.5 w-3.5" />
                Invoices
                {serviceInvoices.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {serviceInvoices.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-1.5 text-xs h-8 px-3 data-[state=active]:shadow-sm">
                <FileText className="h-3.5 w-3.5" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Service Call Details */}
                <Card>
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      Service Call Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Service Call ID
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                            {serviceCall.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(serviceCall.id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Issue Type
                        </Label>
                        <p className="text-sm font-medium">{issueTypeLabel}</p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Created
                        </Label>
                        <p className="text-xs">{formatDateTime(serviceCall.createdAt)}</p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                          Last Updated
                        </Label>
                        <p className="text-xs">{formatDateTime(serviceCall.updatedAt)}</p>
                      </div>
                    </div>

                    {serviceCall.equipmentType && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
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
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Site & Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    {site ? (
                      <>
                        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{site.name}</p>
                              <p className="text-xs text-muted-foreground">{site.address}</p>
                            </div>
                          </div>
                        </div>

                        {customer && (
                          <div className="space-y-2">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              Customer
                            </Label>
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{customer.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                      <p className="text-sm text-muted-foreground">Site information not available</p>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        Requester
                      </Label>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{serviceCall.requesterName}</p>
                          {serviceCall.requesterContact && (
                            <p className="text-xs text-muted-foreground">{serviceCall.requesterContact}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <TaskGroupSection serviceCallId={serviceCall.id} />
            </TabsContent>

            <TabsContent value="time-materials" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4" />
                    Time & Materials Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Time Entries</h4>
                            <p className="text-xs text-muted-foreground">
                              {relatedTimeEntries.length} entries
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{totalHours.toFixed(2)}h</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Package className="h-4 w-4 text-orange-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Materials</h4>
                            <p className="text-xs text-muted-foreground">
                              {relatedMaterials.length} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(totalMaterialCost)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Receipt className="h-4 w-4" />
                      Invoices
                    </CardTitle>
                  </div>
                  <InvoiceGenerator serviceCallId={serviceCall.id} />
                </CardHeader>
                <CardContent className="pb-4">
                  {serviceInvoices.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Receipt className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-sm font-semibold">No invoices yet</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                        Generate an invoice when ready to bill
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
