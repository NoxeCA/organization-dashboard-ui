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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge'
import { RecordPaymentDialog } from '@/components/invoice/record-payment-dialog'
import { CancelInvoiceDialog } from '@/components/invoice/cancel-invoice-dialog'
import { useData } from '@/context/data-context'
import { formatCurrency, formatDate, getTaxCode, PAYMENT_METHOD_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { useState } from 'react'
import { Send, DollarSign, ArrowLeft, Printer, RotateCcw } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/types'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const {
    getInvoice,
    getLineItemsForInvoice,
    getPaymentsForInvoice,
    updateInvoice,
    customers,
    serviceCalls,
    sites,
  } = useData()

  const invoice = getInvoice(invoiceId)
  const lineItems = getLineItemsForInvoice(invoiceId)
  const payments = getPaymentsForInvoice(invoiceId)

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    action: InvoiceStatus | null
    title: string
    description: string
  }>({
    open: false,
    action: null,
    title: '',
    description: '',
  })

  if (!invoice) {
    return (
      <div className="flex flex-col h-screen">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Invoices', href: '/invoices' },
            { label: 'Not Found' },
          ]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The invoice you are looking for does not exist.
            </p>
            <Button onClick={() => router.push('/invoices')}>
              Back to Invoices
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const customer = customers.find((c) => c.id === invoice.customerId)
  const serviceCall = serviceCalls.find((sc) => sc.id === invoice.serviceCallId)
  const site = serviceCall ? sites.find((s) => s.id === serviceCall.siteId) : null
  const taxCode = getTaxCode(invoice.taxCodeId)

  const handleStatusChange = (newStatus: InvoiceStatus) => {
    const actions: Record<InvoiceStatus, { title: string; description: string }> = {
      sent: {
        title: 'Send Invoice',
        description: 'Are you sure you want to send this invoice to the customer? They will receive an email notification.',
      },
      partially_paid: {
        title: 'Record Partial Payment',
        description: 'This invoice has been partially paid.',
      },
      paid: {
        title: 'Mark as Paid',
        description: 'Are you sure this invoice has been paid? This will update the payment records.',
      },
      cancelled: {
        title: 'Cancel Invoice',
        description: 'Are you sure you want to cancel this invoice? This action cannot be undone.',
      },
      overdue: {
        title: 'Mark as Overdue',
        description: 'Are you sure you want to mark this invoice as overdue?',
      },
      draft: {
        title: 'Return to Draft',
        description: 'Are you sure you want to return this invoice to draft status?',
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

    updateInvoice(invoiceId, { status: confirmDialog.action })
    toast.success(`Invoice ${confirmDialog.action}`)
    setConfirmDialog({ open: false, action: null, title: '', description: '' })
  }

  const handlePrint = () => {
    window.print()
  }

  const getPaymentMethodLabel = (method: string): string => {
    return PAYMENT_METHOD_OPTIONS.find(m => m.value === method)?.label || method
  }

  // Determine available actions based on status
  const canSend = invoice.status === 'draft'
  const canRecordPayment = ['sent', 'partially_paid', 'overdue'].includes(invoice.status) && invoice.amountDue > 0
  const canCancel = ['draft', 'sent', 'partially_paid', 'overdue'].includes(invoice.status)
  const canReopen = invoice.status === 'cancelled'

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Invoices', href: '/invoices' },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={() => router.push('/invoices')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Invoice Preview - Print-friendly */}
          <Card className="print:shadow-none">
            <CardHeader className="space-y-6">
              {/* Header with company info and invoice number */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">INVOICE</h1>
                  <div className="text-sm text-muted-foreground mt-2">
                    <p className="font-semibold">Service Management Solutions Inc.</p>
                    <p>123 Business Avenue</p>
                    <p>New York, NY 10001</p>
                    <p>contact@sms-inc.com</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
                  <div className="text-sm text-muted-foreground mt-2">
                    <p>Issued: {formatDate(invoice.issuedDate)}</p>
                    <p>Due: {formatDate(invoice.dueDate)}</p>
                    {invoice.paidDate && <p>Paid: {formatDate(invoice.paidDate)}</p>}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline">{invoice.currency}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bill To and Service Call Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h3>
                  <div className="space-y-1">
                    <p className="font-semibold">{customer?.name || 'Unknown Customer'}</p>
                    {customer?.billingAddress && (
                      <>
                        <p className="text-sm">{customer.billingAddress.line1}</p>
                        {customer.billingAddress.line2 && (
                          <p className="text-sm">{customer.billingAddress.line2}</p>
                        )}
                        <p className="text-sm">
                          {customer.billingAddress.city}, {customer.billingAddress.state} {customer.billingAddress.postalCode}
                        </p>
                      </>
                    )}
                    {!customer?.billingAddress && site && (
                      <>
                        <p className="text-sm">{site.name}</p>
                        <p className="text-sm text-muted-foreground">{site.address}</p>
                      </>
                    )}
                    {customer && (
                      <>
                        <p className="text-sm">{customer.email}</p>
                        <p className="text-sm">{customer.phone}</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">SERVICE CALL</h3>
                  <div className="space-y-1">
                    <p className="font-semibold">{serviceCall?.title || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{serviceCall?.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Line Items Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="capitalize">{item.type}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.totalPrice, invoice.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="text-green-600">-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax ({taxCode?.name || 'Standard'} - {((invoice.taxRate ?? 0.09) * 100).toFixed(0)}%):
                    </span>
                    <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                  </div>
                  {invoice.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Amount Paid:</span>
                        <span>-{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Amount Due:</span>
                        <span className={invoice.amountDue > 0 ? 'text-orange-600' : 'text-green-600'}>
                          {formatCurrency(invoice.amountDue, invoice.currency)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Cancellation Info */}
              {invoice.status === 'cancelled' && invoice.cancellationReason && (
                <>
                  <Separator />
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-400">Invoice Cancelled</p>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                      Reason: {invoice.cancellationReason}
                    </p>
                    {invoice.cancelledAt && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Cancelled on {formatDate(invoice.cancelledAt)}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Payment Terms */}
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Payment Terms:</p>
                <p>{invoice.paymentTerms || 'Payment is due within 15 days of invoice date.'} Please make checks payable to Service Management Solutions Inc.</p>
                <p className="mt-2">Thank you for your business!</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment History - Hidden when printing */}
          {payments.length > 0 && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                  {payments.length} payment{payments.length > 1 ? 's' : ''} recorded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                          <TableCell>{payment.reference || '-'}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Hidden when printing */}
          {(canSend || canRecordPayment || canCancel || canReopen) && (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Update the status of this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {canSend && (
                    <Button onClick={() => handleStatusChange('sent')}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invoice
                    </Button>
                  )}

                  {canRecordPayment && (
                    <RecordPaymentDialog
                      invoice={invoice}
                      trigger={
                        <Button>
                          <DollarSign className="mr-2 h-4 w-4" />
                          Record Payment
                        </Button>
                      }
                    />
                  )}

                  {canCancel && (
                    <CancelInvoiceDialog
                      invoice={invoice}
                      onSuccess={() => router.refresh()}
                    />
                  )}

                  {canReopen && (
                    <Button variant="outline" onClick={() => handleStatusChange('draft')}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reopen as Draft
                    </Button>
                  )}
                </div>
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
