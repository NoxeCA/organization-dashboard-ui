import { Badge } from '@/components/ui/badge'
import { PO_STATUS_COLORS } from '@/lib/constants'
import type { POStatus } from '@/lib/types'

interface POStatusBadgeProps {
  status: POStatus
}

export function POStatusBadge({ status }: POStatusBadgeProps) {
  const labels: Record<POStatus, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    received: 'Received',
    cancelled: 'Cancelled',
  }

  return (
    <Badge className={PO_STATUS_COLORS[status]}>
      {labels[status]}
    </Badge>
  )
}
