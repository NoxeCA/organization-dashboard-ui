'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useData } from '@/context/data-context'
import { formatCurrency, UNIT_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { Plus, Trash2, Save } from 'lucide-react'
import type { POLineItem } from '@/lib/types'

interface LineItemInput extends Omit<POLineItem, 'id' | 'purchaseOrderId' | 'totalPrice'> {
  totalPrice?: number
}

export default function NewPurchaseOrderPage() {
  const router = useRouter()
  const { suppliers, serviceCalls, addPurchaseOrder } = useData()

  const [supplierId, setSupplierId] = useState('')
  const [serviceCallId, setServiceCallId] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [lineItems, setLineItems] = useState<LineItemInput[]>([
    { materialName: '', quantity: 1, unit: 'pcs', unitPrice: 0 },
  ])

  const addLineItem = () => {
    setLineItems([...lineItems, { materialName: '', quantity: 1, unit: 'pcs', unitPrice: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItemInput, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const handleSave = () => {
    // Validation
    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }

    const hasInvalidItems = lineItems.some(
      (item) => !item.materialName || item.quantity <= 0 || item.unitPrice <= 0
    )

    if (hasInvalidItems) {
      toast.error('Please fill in all line item details with valid values')
      return
    }

    try {
      const po = addPurchaseOrder({
        supplierId,
        serviceCallId: serviceCallId && serviceCallId !== 'none' ? serviceCallId : undefined,
        expectedDelivery: expectedDelivery || undefined,
        lineItems: lineItems.map((item) => ({
          materialName: item.materialName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
        })),
      })

      toast.success('Purchase order created successfully')
      router.push(`/purchase-orders/${po.id}`)
    } catch (error) {
      toast.error('Failed to create purchase order')
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Purchase Orders', href: '/purchase-orders' },
          { label: 'New' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Information</CardTitle>
              <CardDescription>Enter the basic information for this purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceCall">Related Service Call (Optional)</Label>
                  <Select value={serviceCallId} onValueChange={setServiceCallId}>
                    <SelectTrigger id="serviceCall">
                      <SelectValue placeholder="Select service call" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {serviceCalls.map((sc) => (
                        <SelectItem key={sc.id} value={sc.id}>
                          {sc.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDelivery">Expected Delivery Date (Optional)</Label>
                  <Input
                    id="expectedDelivery"
                    type="date"
                    value={expectedDelivery}
                    onChange={(e) => setExpectedDelivery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>Add materials to this purchase order</CardDescription>
                </div>
                <Button onClick={addLineItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Line Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Material Name</TableHead>
                      <TableHead className="w-[120px]">Quantity</TableHead>
                      <TableHead className="w-[120px]">Unit</TableHead>
                      <TableHead className="w-[150px]">Unit Price</TableHead>
                      <TableHead className="w-[150px]">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={item.materialName}
                            onChange={(e) => updateLineItem(index, 'materialName', e.target.value)}
                            placeholder="Material name"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateLineItem(index, 'unit', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_OPTIONS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            disabled={lineItems.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold pt-2">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
