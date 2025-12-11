'use client'

import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { POStatusBadge } from '@/components/purchase-order/po-status-badge'
import { useData } from '@/context/data-context'
import { formatCurrency, formatDate } from '@/lib/constants'
import { toast } from 'sonner'
import { useState } from 'react'
import { Send, CheckCircle, Package, XCircle, ArrowLeft } from 'lucide-react'
import type { POStatus } from '@/lib/types'

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const poId = params.id as string

  const {
    getPurchaseOrder,
    getLineItemsForPO,
    updatePurchaseOrder,
    suppliers,
    serviceCalls,
  } = useData()

  const po = getPurchaseOrder(poId)
  const lineItems = getLineItemsForPO(poId)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: POStatus | null
    title: string
    description: string
  }>({
    open: false,
    action: null,
    title: '',
    description: '',
  })

  if (!po) {
    return (
      <div className="flex flex-col h-screen">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Purchase Orders', href: '/purchase-orders' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Purchase Order Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The purchase order you are looking for does not exist.
            </p>
            <Button onClick={() => router.push('/purchase-orders')}>
              Back to Purchase Orders
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const supplier = suppliers.find((s) => s.id === po.supplierId)
  const serviceCall = po.serviceCallId
    ? serviceCalls.find((sc) => sc.id === po.serviceCallId)
    : null

  const handleStatusChange = (newStatus: POStatus) => {
    const actions: Record<POStatus, { title: string; description: string }> = {
      submitted: {
        title: 'Submit Purchase Order',
        description: 'Are you sure you want to submit this purchase order? It will be sent to the supplier for processing.',
      },
      approved: {
        title: 'Approve Purchase Order',
        description: 'Are you sure you want to approve this purchase order? The supplier will be authorized to proceed with the order.',
      },
      received: {
        title: 'Mark as Received',
        description: 'Are you sure all materials have been received? This will update the inventory and mark the PO as complete.',
      },
      cancelled: {
        title: 'Cancel Purchase Order',
        description: 'Are you sure you want to cancel this purchase order? This action cannot be undone.',
      },
      draft: {
        title: 'Return to Draft',
        description: 'Are you sure you want to return this purchase order to draft status?',
      },
    }

    setConfirmDialog({
      open: true,
      action: newStatus,
      ...actions[newStatus],
    })
  }

  const confirmStatusChange = () => {
    if (!confirmDialog.action) return

    updatePurchaseOrder(poId, { status: confirmDialog.action })
    toast.success(`Purchase order ${confirmDialog.action}`)
    setConfirmDialog({ open: false, action: null, title: '', description: '' })
  }

  const canEdit = po.status === 'draft'

  const getAvailableActions = () => {
    switch (po.status) {
      case 'draft':
        return [
          { label: 'Submit', icon: Send, status: 'submitted' as POStatus, variant: 'default' as const },
        ]
      case 'submitted':
        return [
          { label: 'Approve', icon: CheckCircle, status: 'approved' as POStatus, variant: 'default' as const },
          { label: 'Cancel', icon: XCircle, status: 'cancelled' as POStatus, variant: 'destructive' as const },
        ]
      case 'approved':
        return [
          { label: 'Mark Received', icon: Package, status: 'received' as POStatus, variant: 'default' as const },
          { label: 'Cancel', icon: XCircle, status: 'cancelled' as POStatus, variant: 'destructive' as const },
        ]
      default:
        return []
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Purchase Orders', href: '/purchase-orders' },
          { label: po.poNumber },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{po.poNumber}</CardTitle>
                  <CardDescription>Purchase order details and line items</CardDescription>
                </div>
                <POStatusBadge status={po.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                    <p className="text-lg font-medium">{supplier?.name || 'Unknown'}</p>
                    {supplier && (
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        <p>{supplier.email}</p>
                        <p>{supplier.phone}</p>
                      </div>
                    )}
                  </div>

                  {serviceCall && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Related Service Call</h3>
                      <p className="text-lg">{serviceCall.title}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created Date</h3>
                    <p className="text-lg">{formatDate(po.createdAt)}</p>
                  </div>

                  {po.expectedDelivery && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Expected Delivery</h3>
                      <p className="text-lg">{formatDate(po.expectedDelivery)}</p>
                    </div>
                  )}

                  {po.receivedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Received Date</h3>
                      <p className="text-lg">{formatDate(po.receivedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Line Items</h3>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.materialName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-xl font-semibold">
                <span>Total Amount:</span>
                <span>{formatCurrency(po.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {getAvailableActions().length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Update the status of this purchase order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {getAvailableActions().map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      onClick={() => handleStatusChange(action.status)}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!canEdit && po.status === 'draft' && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  This purchase order is in draft status. Submit it to send to the supplier.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
