'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { Pencil, FileText, Calendar, User, MapPin, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
    tasks,
    timeEntries,
    materialUsages,
    getInvoicesForServiceCall,
    invoices,
    getLineItemsForInvoice,
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
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Service Call Not Found</h2>
            <p className="text-muted-foreground mt-2">
              The service call you're looking for doesn't exist.
            </p>
            <Button className="mt-4" onClick={() => router.push('/service-calls')}>
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

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Service Calls', href: '/service-calls' },
          { label: serviceCall.id },
        ]}
        actions={
          <div className="flex gap-2">
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
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{serviceCall.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={serviceCall.status} />
              <PriorityBadge priority={serviceCall.priority} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="time-materials">Time & Materials</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Service Call ID
                    </div>
                    <div className="text-lg font-semibold">{serviceCall.id}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      Issue Type
                    </div>
                    <div className="text-lg">{issueTypeLabel}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Created
                    </div>
                    <div className="text-lg">{formatDateTime(serviceCall.createdAt)}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last Updated
                    </div>
                    <div className="text-lg">{formatDateTime(serviceCall.updatedAt)}</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-base leading-relaxed">{serviceCall.description}</p>
                </div>

                {serviceCall.equipmentType && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Equipment Type
                      </Label>
                      <p className="text-base">{serviceCall.equipmentType}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {site ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Site Name
                        </Label>
                        <p className="text-base font-medium">{site.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-base">{site.address}</p>
                      </div>
                      {customer && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                              Customer
                            </Label>
                            <p className="text-base font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">Site information not available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Requester Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-base font-medium">{serviceCall.requesterName}</p>
                  </div>
                  {serviceCall.requesterContact && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Contact</Label>
                      <p className="text-base">{serviceCall.requesterContact}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <TaskSection serviceCallId={serviceCall.id} />
          </TabsContent>

          <TabsContent value="time-materials" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{serviceTasks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Material Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalMaterialCost)}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Time & Materials Summary</CardTitle>
                <CardDescription>
                  Detailed time tracking and material usage will be enhanced in future iterations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Time Entries: {relatedTimeEntries.length}</h4>
                    <p className="text-sm text-muted-foreground">
                      Total billable hours: {totalHours.toFixed(2)}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Materials: {relatedMaterials.length}</h4>
                    <p className="text-sm text-muted-foreground">
                      Total material cost: {formatCurrency(totalMaterialCost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Invoices generated for this service call
                </CardDescription>
              </CardHeader>
              <CardContent>
                {serviceInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No invoices generated yet</p>
                    <InvoiceGenerator serviceCallId={serviceCall.id} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <InvoiceGenerator serviceCallId={serviceCall.id} />
                    </div>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Issued Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                              <TableCell>
                                <Badge className={INVOICE_STATUS_COLORS[invoice.status]}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                              <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                              <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/invoices/${invoice.id}`)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the status of this service call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div>
                <StatusBadge status={serviceCall.status} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              {SERVICE_CALL_TRANSITIONS[serviceCall.status].length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This service call is in a terminal state and cannot be changed.
                </p>
              ) : (
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setSelectedStatus(value as ServiceCallStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Priority</DialogTitle>
            <DialogDescription>
              Change the priority level of this service call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Priority</Label>
              <div>
                <PriorityBadge priority={serviceCall.priority} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">New Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={(value) => setSelectedPriority(value as ServiceCallPriority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
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
  )
}
