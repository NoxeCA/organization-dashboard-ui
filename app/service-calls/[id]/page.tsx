'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
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
import { OwnerSelector } from '@/components/service-call/owner-selector'
import { TaskGroupSection } from '@/components/task-group/task-group-section'
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
    employees,
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
          }
        />

        <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto w-full">
          {/* Main Header Area */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">{serviceCall.id}</span>
                <span>•</span>
                <span>{issueTypeLabel}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {serviceCall.requesterName}
                </span>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{serviceCall.title}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">{serviceCall.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                      <StatusBadge status={serviceCall.status} className="text-sm px-3 py-1 cursor-pointer" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={serviceCall.status}
                      onValueChange={(val) => updateServiceCall(serviceCall.id, { status: val as ServiceCallStatus })}
                    >
                      {SERVICE_CALL_STATUS_OPTIONS
                        .filter((option) =>
                          option.value === serviceCall.status ||
                          SERVICE_CALL_TRANSITIONS[serviceCall.status].includes(option.value)
                        )
                        .map((option) => (
                          <DropdownMenuRadioItem key={option.value} value={option.value}>
                            {option.label}
                          </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                      <PriorityBadge priority={serviceCall.priority} className="text-sm px-3 py-1 cursor-pointer" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={serviceCall.priority}
                      onValueChange={(val) => updateServiceCall(serviceCall.id, { priority: val as ServiceCallPriority })}
                    >
                      {PRIORITY_OPTIONS.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value}>
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-5 w-px bg-border mx-1" />

                <OwnerSelector
                  employees={employees}
                  ownerId={serviceCall.ownerId}
                  onOwnerChange={(ownerId) => updateServiceCall(serviceCall.id, { ownerId })}
                  placeholder="Assign owner"
                />
              </div>
            </div>

            {/* Site & Customer Card - Compact Side Widget */}
            <div className="w-full md:w-80 shrink-0">
               <Card className="bg-muted/30 border-none shadow-none">
                 <CardContent className="p-4 space-y-4">
                   {site ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{site.name}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{site.address}</p>
                          </div>
                        </div>
                        {customer && (
                          <div className="flex items-start gap-3 border-t border-dashed pt-3">
                            <div className="mt-0.5 h-8 w-8 rounded-full bg-background flex items-center justify-center border shadow-sm">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No site assigned</span>
                    )}
                 </CardContent>
               </Card>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Card className="shadow-sm">
               <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-xs font-medium text-muted-foreground uppercase">Progress</span>
                 <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold">{completedTasks}/{serviceTasks.length}</span>
                   <span className="text-xs text-muted-foreground mb-1">Tasks</span>
                 </div>
                 <Progress value={taskCompletionPercentage} className="h-1 mt-2" />
               </CardContent>
             </Card>

             <Card className="shadow-sm">
               <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-xs font-medium text-muted-foreground uppercase">Time Logged</span>
                 <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold">{totalHours.toFixed(1)}h</span>
                   <span className="text-xs text-muted-foreground mb-1">/ {totalEstimatedHours}h est.</span>
                 </div>
                 <div className="w-full h-1 bg-muted rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((totalHours / (totalEstimatedHours || 1)) * 100, 100)}%` }} />
                 </div>
               </CardContent>
             </Card>

             <Card className="shadow-sm">
               <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-xs font-medium text-muted-foreground uppercase">Materials</span>
                 <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold">{formatCurrency(totalMaterialCost)}</span>
                   <span className="text-xs text-muted-foreground mb-1">{relatedMaterials.length} items</span>
                 </div>
                 <div className="w-full h-1 bg-muted rounded-full mt-2" />
               </CardContent>
             </Card>

             <Card className="shadow-sm">
               <CardContent className="p-4 flex flex-col gap-1">
                 <span className="text-xs font-medium text-muted-foreground uppercase">Invoiced</span>
                 <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold">{formatCurrency(totalInvoicedAmount)}</span>
                   <span className="text-xs text-muted-foreground mb-1">{serviceInvoices.length} inv.</span>
                 </div>
                  <div className="w-full h-1 bg-muted rounded-full mt-2" />
               </CardContent>
             </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="tasks" className="space-y-6">
            <div className="border-b">
              <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0 rounded-none">
                <TabsTrigger 
                  value="tasks" 
                  className="rounded-none border-b-2 border-transparent px-0 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent shadow-none"
                >
                  Tasks
                  {serviceTasks.length > 0 && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {serviceTasks.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="time-materials" 
                  className="rounded-none border-b-2 border-transparent px-0 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent shadow-none"
                >
                  Time & Materials
                </TabsTrigger>
                <TabsTrigger 
                  value="invoices" 
                  className="rounded-none border-b-2 border-transparent px-0 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent shadow-none"
                >
                  Invoices
                  {serviceInvoices.length > 0 && (
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {serviceInvoices.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="rounded-none border-b-2 border-transparent px-0 py-2 font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent shadow-none"
                >
                  Details
                </TabsTrigger>
              </TabsList>
            </div>

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

        {/* Dialogs removed as they are replaced by DropdownMenu interactions */}
      </div>
    </TooltipProvider>
  )
}
