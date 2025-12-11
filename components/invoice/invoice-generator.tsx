'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useData } from '@/context/data-context'
import { formatCurrency, RATE_MULTIPLIERS, LOW_INVOICE_THRESHOLD } from '@/lib/constants'
import { toast } from 'sonner'
import { FileText, Plus } from 'lucide-react'
import type { InvoiceLineItem, InvoiceLineType } from '@/lib/types'

interface InvoiceGeneratorProps {
  serviceCallId: string
}

interface BillableItem {
  id: string
  type: InvoiceLineType
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taskId?: string
  selected: boolean
}

export function InvoiceGenerator({ serviceCallId }: InvoiceGeneratorProps) {
  const router = useRouter()
  const {
    getServiceCall,
    getTasksForServiceCall,
    getTimeEntriesForTask,
    getMaterialsForTask,
    employees,
    addInvoice,
  } = useData()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [lowAmountDialogOpen, setLowAmountDialogOpen] = useState(false)
  const [items, setItems] = useState<BillableItem[]>([])

  // Initialize items when dialog opens
  const initializeItems = () => {
    // Only include completed tasks
    const tasks = getTasksForServiceCall(serviceCallId)
      .filter(t => t.status === 'completed')
    const billableItems: BillableItem[] = []

    tasks.forEach((task) => {
      // Get time entries for this task
      const timeEntries = getTimeEntriesForTask(task.id)
      timeEntries
        .filter((te) => te.billable)
        .forEach((te) => {
          const employee = employees.find((e) => e.id === te.employeeId)
          const rateMultiplier = RATE_MULTIPLIERS[te.rateType]
          const unitPrice = employee ? employee.hourlyRate * rateMultiplier : 0
          const totalPrice = te.hours * unitPrice

          billableItems.push({
            id: te.id,
            type: 'labor',
            description: `${task.title} - ${employee?.name || 'Unknown'} (${te.rateType})${te.notes ? ' - ' + te.notes : ''}`,
            quantity: te.hours,
            unitPrice,
            totalPrice,
            taskId: task.id,
            selected: true,
          })
        })

      // Get materials for this task (exclude customer-provided materials)
      const materials = getMaterialsForTask(task.id)
      materials
        .filter((m) => m.unitCost && m.unitCost > 0 && m.source !== 'customer_provided')
        .forEach((m) => {
          billableItems.push({
            id: m.id,
            type: 'material',
            description: `${m.materialName} (${task.title})`,
            quantity: m.quantity,
            unitPrice: m.unitCost || 0,
            totalPrice: m.quantity * (m.unitCost || 0),
            taskId: task.id,
            selected: true,
          })
        })
    })

    setItems(billableItems)
  }

  const handleOpen = () => {
    // Get service call to check status
    const serviceCall = getServiceCall(serviceCallId)

    if (!serviceCall) {
      toast.error('Service call not found')
      return
    }

    // Only allow invoicing for resolved or invoiced service calls
    if (!['resolved', 'invoiced'].includes(serviceCall.status)) {
      toast.error('Service call must be resolved before generating an invoice')
      return
    }

    // Check that there are completed tasks
    const tasks = getTasksForServiceCall(serviceCallId)
    const completedTasks = tasks.filter(t => t.status === 'completed')

    if (completedTasks.length === 0) {
      toast.error('No completed tasks to invoice')
      return
    }

    initializeItems()
    setDialogOpen(true)
  }

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    )
  }

  const selectedItems = useMemo(() => items.filter((item) => item.selected), [items])

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [selectedItems]
  )

  const taxAmount = useMemo(() => subtotal * 0.09, [subtotal]) // 9% tax
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount])

  const handleGenerateInvoice = (skipWarning: boolean = false) => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to invoice')
      return
    }

    // Check for low invoice total
    if (!skipWarning && total < LOW_INVOICE_THRESHOLD) {
      setLowAmountDialogOpen(true)
      return
    }

    try {
      const lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[] = selectedItems.map((item) => ({
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        taskId: item.taskId,
      }))

      const invoice = addInvoice(serviceCallId, lineItems)
      toast.success('Invoice generated successfully')
      setDialogOpen(false)
      setLowAmountDialogOpen(false)
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      toast.error('Failed to generate invoice')
      console.error(error)
    }
  }

  return (
    <>
      <Button onClick={handleOpen}>
        <Plus className="mr-2 h-4 w-4" />
        Generate Invoice
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Select billable items to include in the invoice. Uncheck any items you do not want to bill.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No billable items found for this service call.</p>
                    <p className="text-sm mt-2">
                      Add time entries or materials with costs to generate an invoice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={() => toggleItem(item.id)}
                            />
                          </TableCell>
                          <TableCell className="capitalize">{item.type}</TableCell>
                          <TableCell className="max-w-[300px]">{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Summary</CardTitle>
                    <CardDescription>
                      Preview of totals for selected items ({selectedItems.length} items)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (9%):</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleGenerateInvoice()} disabled={selectedItems.length === 0}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Low Amount Warning Dialog */}
      <AlertDialog open={lowAmountDialogOpen} onOpenChange={setLowAmountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Low Invoice Amount</AlertDialogTitle>
            <AlertDialogDescription>
              The invoice total is only {formatCurrency(total)}, which is below the typical minimum of {formatCurrency(LOW_INVOICE_THRESHOLD)}. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleGenerateInvoice(true)}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
