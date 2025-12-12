'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useData } from '@/context/data-context'
import { formatCurrency, PAYMENT_METHOD_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { DollarSign } from 'lucide-react'
import type { Invoice, PaymentMethod } from '@/lib/types'

interface RecordPaymentDialogProps {
  invoice: Invoice
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function RecordPaymentDialog({ invoice, trigger, onSuccess }: RecordPaymentDialogProps) {
  const { addPayment } = useData()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(invoice.amountDue.toString())
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Reset to defaults when opening
      setAmount(invoice.amountDue.toString())
      setPaymentDate(new Date().toISOString().split('T')[0])
      setPaymentMethod('bank_transfer')
      setReference('')
      setNotes('')
    }
    setOpen(isOpen)
  }

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount)

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (paymentAmount > invoice.amountDue) {
      toast.error(`Payment amount cannot exceed amount due (${formatCurrency(invoice.amountDue, invoice.currency)})`)
      return
    }

    if (!paymentDate) {
      toast.error('Please select a payment date')
      return
    }

    try {
      addPayment({
        invoiceId: invoice.id,
        amount: paymentAmount,
        paymentDate,
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
      })

      const isFullPayment = paymentAmount >= invoice.amountDue
      toast.success(
        isFullPayment
          ? 'Payment recorded - Invoice marked as paid'
          : `Partial payment of ${formatCurrency(paymentAmount, invoice.currency)} recorded`
      )

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to record payment')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.invoiceNumber}.
            Amount due: {formatCurrency(invoice.amountDue, invoice.currency)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Payment Amount ({invoice.currency})</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.amountDue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(invoice.amountDue.toString())}
              >
                Full Amount
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount((invoice.amountDue / 2).toFixed(2))}
              >
                50%
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Check #, Transaction ID, etc."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this payment"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
