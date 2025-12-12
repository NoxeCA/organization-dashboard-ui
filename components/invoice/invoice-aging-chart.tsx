'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useData } from '@/context/data-context'
import { formatCurrency } from '@/lib/constants'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgingBucket {
  label: string
  range: string
  amount: number
  count: number
  color: string
  bgColor: string
}

export function InvoiceAgingChart({ className }: { className?: string }) {
  const { invoices } = useData()

  const agingData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const buckets: AgingBucket[] = [
      { label: 'Current', range: 'Not yet due', amount: 0, count: 0, color: 'text-green-600', bgColor: 'bg-green-500' },
      { label: '1-30 Days', range: '1-30 days overdue', amount: 0, count: 0, color: 'text-yellow-600', bgColor: 'bg-yellow-500' },
      { label: '31-60 Days', range: '31-60 days overdue', amount: 0, count: 0, color: 'text-orange-600', bgColor: 'bg-orange-500' },
      { label: '61-90 Days', range: '61-90 days overdue', amount: 0, count: 0, color: 'text-red-500', bgColor: 'bg-red-500' },
      { label: '90+ Days', range: 'Over 90 days overdue', amount: 0, count: 0, color: 'text-red-700', bgColor: 'bg-red-700' },
    ]

    // Only consider outstanding invoices (sent, partially_paid, overdue)
    const outstandingInvoices = invoices.filter((inv) =>
      ['sent', 'partially_paid', 'overdue'].includes(inv.status)
    )

    outstandingInvoices.forEach((invoice) => {
      const dueDate = new Date(invoice.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysOverdue <= 0) {
        buckets[0].amount += invoice.amountDue
        buckets[0].count++
      } else if (daysOverdue <= 30) {
        buckets[1].amount += invoice.amountDue
        buckets[1].count++
      } else if (daysOverdue <= 60) {
        buckets[2].amount += invoice.amountDue
        buckets[2].count++
      } else if (daysOverdue <= 90) {
        buckets[3].amount += invoice.amountDue
        buckets[3].count++
      } else {
        buckets[4].amount += invoice.amountDue
        buckets[4].count++
      }
    })

    const totalOutstanding = buckets.reduce((sum, b) => sum + b.amount, 0)

    return {
      buckets,
      totalOutstanding,
      totalCount: outstandingInvoices.length,
    }
  }, [invoices])

  const maxAmount = Math.max(...agingData.buckets.map((b) => b.amount), 1)

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Invoice Aging
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {agingData.totalCount} outstanding invoice{agingData.totalCount !== 1 ? 's' : ''} totaling {formatCurrency(agingData.totalOutstanding)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {agingData.buckets.map((bucket, index) => (
            <div key={bucket.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn('font-medium', bucket.color)}>{bucket.label}</span>
                  {bucket.count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({bucket.count} invoice{bucket.count !== 1 ? 's' : ''})
                    </span>
                  )}
                  {index >= 3 && bucket.amount > 0 && (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn('font-semibold', bucket.color)}>
                      {formatCurrency(bucket.amount)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{bucket.range}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', bucket.bgColor)}
                  style={{ width: `${(bucket.amount / maxAmount) * 100}%` }}
                />
              </div>
            </div>
          ))}

          {/* Risk Indicator */}
          {(agingData.buckets[3].amount > 0 || agingData.buckets[4].amount > 0) && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Collection Risk
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {formatCurrency(agingData.buckets[3].amount + agingData.buckets[4].amount)} is overdue by 60+ days.
                    Consider following up with these customers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
