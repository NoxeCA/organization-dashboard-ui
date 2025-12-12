'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useData } from '@/context/data-context'
import { formatCurrency, CANCELLATION_REASONS } from '@/lib/constants'
import { toast } from 'sonner'
import { XCircle, AlertTriangle } from 'lucide-react'
import type { Invoice } from '@/lib/types'

interface CancelInvoiceDialogProps {
  invoice: Invoice
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CancelInvoiceDialog({ invoice, trigger, onSuccess }: CancelInvoiceDialogProps) {
  const { cancelInvoice } = useData()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<string>('')
  const [customReason, setCustomReason] = useState('')

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setReason('')
      setCustomReason('')
    }
    setOpen(isOpen)
  }

  const handleCancel = () => {
    const finalReason = reason === 'Other' ? customReason : reason

    if (!finalReason) {
      toast.error('Please select or enter a cancellation reason')
      return
    }

    try {
      cancelInvoice(invoice.id, finalReason)
      toast.success('Invoice cancelled successfully')
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to cancel invoice')
      console.error(error)
    }
  }

  const hasPayments = invoice.amountPaid > 0
  const isSent = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue'

  return (
    <AlertDialog open={open} onOpenChange={handleOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Invoice
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Invoice {invoice.invoiceNumber}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <span className="block">
              This will cancel the invoice and make all associated time entries and materials
              available for re-invoicing.
            </span>

            {hasPayments && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This invoice has payments totaling {formatCurrency(invoice.amountPaid, invoice.currency)}.
                  Cancelling will not automatically refund these payments.
                </AlertDescription>
              </Alert>
            )}

            {isSent && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This invoice has been sent to the customer. Consider notifying them of the cancellation.
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Please specify *</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter the reason for cancellation"
                rows={2}
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Keep Invoice</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!reason || (reason === 'Other' && !customReason)}
          >
            Cancel Invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
