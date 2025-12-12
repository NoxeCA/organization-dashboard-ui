'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useData } from '@/context/data-context'
import {
  formatCurrency,
  RATE_MULTIPLIERS,
  LOW_INVOICE_THRESHOLD,
  CURRENCIES,
  TAX_CODES,
  getTaxCode,
} from '@/lib/constants'
import { toast } from 'sonner'
import {
  FileText,
  Plus,
  Clock,
  Package,
  ChevronDown,
  ChevronRight,
  Receipt,
  DollarSign,
  Percent,
  Check,
  Minus,
  Building2,
  User,
  Calendar,
} from 'lucide-react'
import type { InvoiceLineItem, InvoiceLineType } from '@/lib/types'
import { cn } from '@/lib/utils'

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
  taskTitle?: string
  selected: boolean
  sourceType: 'time_entry' | 'material'
  sourceId: string
  employeeName?: string
  rateType?: string
  notes?: string
}

export function InvoiceGenerator({ serviceCallId }: InvoiceGeneratorProps) {
  const router = useRouter()
  const {
    getServiceCall,
    getTasksForServiceCall,
    getTimeEntriesForTask,
    getMaterialsForTask,
    employees,
    customers,
    addInvoice,
  } = useData()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [lowAmountDialogOpen, setLowAmountDialogOpen] = useState(false)
  const [items, setItems] = useState<BillableItem[]>([])
  const [currency, setCurrency] = useState('USD')
  const [taxCodeId, setTaxCodeId] = useState('standard')
  const [laborOpen, setLaborOpen] = useState(true)
  const [materialsOpen, setMaterialsOpen] = useState(true)

  // Get customer for default currency/tax code
  const serviceCall = getServiceCall(serviceCallId)
  const customer = serviceCall ? customers.find((c) => c.id === serviceCall.customerId) : null

  // Initialize items when sheet opens
  const initializeItems = () => {
    // Set defaults from customer
    if (customer) {
      setCurrency(customer.defaultCurrency || 'USD')
      setTaxCodeId(customer.defaultTaxCodeId || 'standard')
    }

    // Only include completed tasks
    const tasks = getTasksForServiceCall(serviceCallId).filter((t) => t.status === 'completed')
    const billableItems: BillableItem[] = []

    tasks.forEach((task) => {
      // Get time entries for this task - filter out already invoiced
      const timeEntries = getTimeEntriesForTask(task.id)
      timeEntries
        .filter((te) => te.billable && !te.invoiced)
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
            taskTitle: task.title,
            selected: true,
            sourceType: 'time_entry',
            sourceId: te.id,
            employeeName: employee?.name,
            rateType: te.rateType,
            notes: te.notes,
          })
        })

      // Get materials for this task - filter out already invoiced and customer-provided
      const materials = getMaterialsForTask(task.id)
      materials
        .filter((m) => m.unitCost && m.unitCost > 0 && m.source !== 'customer_provided' && !m.invoiced)
        .forEach((m) => {
          billableItems.push({
            id: m.id,
            type: 'material',
            description: `${m.materialName} (${task.title})`,
            quantity: m.quantity,
            unitPrice: m.unitCost || 0,
            totalPrice: m.quantity * (m.unitCost || 0),
            taskId: task.id,
            taskTitle: task.title,
            selected: true,
            sourceType: 'material',
            sourceId: m.id,
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
    const completedTasks = tasks.filter((t) => t.status === 'completed')

    if (completedTasks.length === 0) {
      toast.error('No completed tasks to invoice')
      return
    }

    initializeItems()
    setSheetOpen(true)
  }

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  // Separate items by type
  const laborItems = useMemo(() => items.filter((item) => item.type === 'labor'), [items])
  const materialItems = useMemo(() => items.filter((item) => item.type === 'material'), [items])

  const selectedLaborItems = useMemo(() => laborItems.filter((item) => item.selected), [laborItems])
  const selectedMaterialItems = useMemo(() => materialItems.filter((item) => item.selected), [materialItems])
  const selectedItems = useMemo(() => items.filter((item) => item.selected), [items])

  // Totals by type
  const laborTotal = useMemo(
    () => selectedLaborItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [selectedLaborItems]
  )
  const materialsTotal = useMemo(
    () => selectedMaterialItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [selectedMaterialItems]
  )

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.totalPrice, 0),
    [selectedItems]
  )

  // Get selected tax rate
  const selectedTaxCode = getTaxCode(taxCodeId)
  const taxRate = selectedTaxCode?.rate ?? 0.09

  const taxAmount = useMemo(() => subtotal * taxRate, [subtotal, taxRate])
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount])

  // Toggle all items of a type
  const toggleAllLabor = () => {
    const allSelected = laborItems.every((item) => item.selected)
    setItems((prev) =>
      prev.map((item) => (item.type === 'labor' ? { ...item, selected: !allSelected } : item))
    )
  }

  const toggleAllMaterials = () => {
    const allSelected = materialItems.every((item) => item.selected)
    setItems((prev) =>
      prev.map((item) => (item.type === 'material' ? { ...item, selected: !allSelected } : item))
    )
  }

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
        sourceType: item.sourceType,
        sourceId: item.sourceId,
      }))

      const invoice = addInvoice(serviceCallId, lineItems, currency, taxCodeId)
      toast.success('Invoice generated successfully')
      setSheetOpen(false)
      setLowAmountDialogOpen(false)
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      toast.error('Failed to generate invoice')
      console.error(error)
    }
  }

  // Check selection state for a group
  const getLaborSelectionState = () => {
    if (laborItems.length === 0) return 'none'
    if (laborItems.every((item) => item.selected)) return 'all'
    if (laborItems.some((item) => item.selected)) return 'some'
    return 'none'
  }

  const getMaterialsSelectionState = () => {
    if (materialItems.length === 0) return 'none'
    if (materialItems.every((item) => item.selected)) return 'all'
    if (materialItems.some((item) => item.selected)) return 'some'
    return 'none'
  }

  // Get total hours for labor
  const totalHours = useMemo(
    () => selectedLaborItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedLaborItems]
  )

  return (
    <>
      <Button onClick={handleOpen}>
        <Plus className="mr-2 h-4 w-4" />
        Generate Invoice
      </Button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl lg:max-w-4xl flex flex-col p-0 gap-0"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl">Generate Invoice</SheetTitle>
                <SheetDescription className="mt-1">
                  Review and select billable items for this service call
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl">No billable items</h3>
                <p className="text-muted-foreground mt-2 max-w-sm">
                  Add time entries or materials with costs to generate an invoice.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Customer & Service Call Info */}
              <div className="px-6 py-4 border-b bg-muted/20">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{customer?.name || 'Unknown Customer'}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{serviceCall?.title}</span>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Items Selection */}
                <div className="flex-1 flex flex-col overflow-hidden border-r">
                  {/* Section Header */}
                  <div className="px-6 py-3 border-b bg-background">
                    <h3 className="font-semibold">Billable Items</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedItems.length} of {items.length} items selected
                    </p>
                  </div>

                  {/* Scrollable Items */}
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      {/* Labor Section */}
                      {laborItems.length > 0 && (
                        <Collapsible open={laborOpen} onOpenChange={setLaborOpen}>
                          <div className="rounded-xl border overflow-hidden bg-background shadow-sm">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    {laborOpen ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-base">Labor</span>
                                      <Badge variant="secondary" className="text-xs font-normal">
                                        {selectedLaborItems.length}/{laborItems.length} selected
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {totalHours}h total from completed tasks
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                                    {formatCurrency(laborTotal, currency)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleAllLabor()
                                    }}
                                    className={cn(
                                      'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors',
                                      getLaborSelectionState() === 'all'
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : getLaborSelectionState() === 'some'
                                          ? 'bg-primary/50 border-primary/50 text-primary-foreground'
                                          : 'border-input hover:bg-muted'
                                    )}
                                  >
                                    {getLaborSelectionState() === 'all' && <Check className="h-4 w-4" />}
                                    {getLaborSelectionState() === 'some' && <Minus className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border-t divide-y">
                                {laborItems.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={cn(
                                      'flex items-start gap-4 p-4 cursor-pointer transition-colors',
                                      item.selected
                                        ? 'bg-background hover:bg-muted/30'
                                        : 'bg-muted/30 opacity-60 hover:opacity-80'
                                    )}
                                  >
                                    <Checkbox
                                      checked={item.selected}
                                      onCheckedChange={() => toggleItem(item.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="font-medium">{item.employeeName}</span>
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] px-1.5 py-0 h-5 capitalize font-normal"
                                        >
                                          {item.rateType}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {item.taskTitle}
                                      </p>
                                      {item.notes && (
                                        <p className="text-xs text-muted-foreground/70 mt-1 italic">
                                          {item.notes}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="font-semibold">
                                        {formatCurrency(item.totalPrice, currency)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.quantity}h × {formatCurrency(item.unitPrice, currency)}/h
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}

                      {/* Materials Section */}
                      {materialItems.length > 0 && (
                        <Collapsible open={materialsOpen} onOpenChange={setMaterialsOpen}>
                          <div className="rounded-xl border overflow-hidden bg-background shadow-sm">
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    {materialsOpen ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                      <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-base">Materials</span>
                                      <Badge variant="secondary" className="text-xs font-normal">
                                        {selectedMaterialItems.length}/{materialItems.length} selected
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      Parts and supplies used
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-semibold text-lg text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(materialsTotal, currency)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleAllMaterials()
                                    }}
                                    className={cn(
                                      'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors',
                                      getMaterialsSelectionState() === 'all'
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : getMaterialsSelectionState() === 'some'
                                          ? 'bg-primary/50 border-primary/50 text-primary-foreground'
                                          : 'border-input hover:bg-muted'
                                    )}
                                  >
                                    {getMaterialsSelectionState() === 'all' && <Check className="h-4 w-4" />}
                                    {getMaterialsSelectionState() === 'some' && <Minus className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="border-t divide-y">
                                {materialItems.map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => toggleItem(item.id)}
                                    className={cn(
                                      'flex items-start gap-4 p-4 cursor-pointer transition-colors',
                                      item.selected
                                        ? 'bg-background hover:bg-muted/30'
                                        : 'bg-muted/30 opacity-60 hover:opacity-80'
                                    )}
                                  >
                                    <Checkbox
                                      checked={item.selected}
                                      onCheckedChange={() => toggleItem(item.id)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium">{item.description.split(' (')[0]}</p>
                                      <p className="text-sm text-muted-foreground">{item.taskTitle}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <div className="font-semibold">
                                        {formatCurrency(item.totalPrice, currency)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.quantity} × {formatCurrency(item.unitPrice, currency)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Right: Summary Panel */}
                <div className="w-80 flex flex-col bg-muted/20">
                  {/* Invoice Settings */}
                  <div className="p-6 border-b">
                    <h3 className="font-semibold mb-4">Invoice Settings</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          Currency
                        </label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.symbol} {curr.code} - {curr.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          Tax Code
                        </label>
                        <Select value={taxCodeId} onValueChange={setTaxCodeId}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tax Code" />
                          </SelectTrigger>
                          <SelectContent>
                            {TAX_CODES.map((tax) => (
                              <SelectItem key={tax.id} value={tax.id}>
                                {tax.name} ({(tax.rate * 100).toFixed(0)}%)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Summary */}
                  <div className="flex-1 p-6">
                    <h3 className="font-semibold mb-4">Invoice Summary</h3>
                    <div className="space-y-3">
                      {laborItems.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            Labor ({selectedLaborItems.length})
                          </span>
                          <span className="font-medium">{formatCurrency(laborTotal, currency)}</span>
                        </div>
                      )}
                      {materialItems.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Package className="h-3.5 w-3.5" />
                            Materials ({selectedMaterialItems.length})
                          </span>
                          <span className="font-medium">{formatCurrency(materialsTotal, currency)}</span>
                        </div>
                      )}
                      <Separator className="my-3" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tax ({selectedTaxCode?.name || 'Standard'} {(taxRate * 100).toFixed(0)}%)
                        </span>
                        <span className="font-medium">{formatCurrency(taxAmount, currency)}</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total</span>
                        <span className="font-bold text-2xl">{formatCurrency(total, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 border-t bg-background">
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleGenerateInvoice()}
                        disabled={selectedItems.length === 0}
                        className="w-full h-11"
                        size="lg"
                      >
                        <Receipt className="mr-2 h-5 w-5" />
                        Create Invoice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSheetOpen(false)}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Low Amount Warning Dialog */}
      <AlertDialog open={lowAmountDialogOpen} onOpenChange={setLowAmountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Low Invoice Amount</AlertDialogTitle>
            <AlertDialogDescription>
              The invoice total is only {formatCurrency(total, currency)}, which is below the typical
              minimum of {formatCurrency(LOW_INVOICE_THRESHOLD, currency)}. Are you sure you want to
              proceed?
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
