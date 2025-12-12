import { Badge } from '@/components/ui/badge'
import { INVOICE_STATUS_COLORS } from '@/lib/constants'
import type { InvoiceStatus } from '@/lib/types'

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    partially_paid: 'Partially Paid',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  }

  return (
    <Badge className={INVOICE_STATUS_COLORS[status]}>
      {labels[status]}
    </Badge>
  )
}
