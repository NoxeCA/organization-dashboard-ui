'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useData, type InvoiceProgressData } from '@/context/data-context'
import { formatCurrency } from '@/lib/constants'
import {
  Receipt,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InvoiceProgressCardProps {
  serviceCallId: string
  compact?: boolean
  className?: string
}

export function InvoiceProgressCard({
  serviceCallId,
  compact = false,
  className,
}: InvoiceProgressCardProps) {
  const { getInvoiceProgress, getInvoicesForServiceCall } = useData()

  const progress = useMemo(
    () => getInvoiceProgress(serviceCallId),
    [getInvoiceProgress, serviceCallId]
  )

  const invoices = useMemo(
    () => getInvoicesForServiceCall(serviceCallId),
    [getInvoicesForServiceCall, serviceCallId]
  )

  // Don't render if there's nothing to show
  if (progress.totalAmount === 0 && invoices.length === 0) {
    return null
  }

  // Compact version for stats grid
  if (compact) {
    return (
      <Card className={cn('shadow-sm', className)}>
        <CardContent className="p-4 flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Invoice Progress
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">
              {progress.progressPercent}%
            </span>
            <span className="text-xs text-muted-foreground mb-1">
              {formatCurrency(progress.invoicedAmount)} / {formatCurrency(progress.totalAmount)}
            </span>
          </div>
          <Progress
            value={progress.progressPercent}
            className={cn(
              'h-1 mt-2',
              progress.isFullyInvoiced ? '[&>div]:bg-green-500' : progress.hasUninvoicedItems ? '[&>div]:bg-amber-500' : ''
            )}
          />
          {progress.hasUninvoicedItems && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
              <AlertCircle className="h-3 w-3" />
              <span>{formatCurrency(progress.uninvoicedAmount)} pending</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full version with details
  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Invoice Progress
            </CardTitle>
            {progress.isFullyInvoiced ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Fully Invoiced
              </Badge>
            ) : progress.hasUninvoicedItems ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending Items
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pb-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold">{progress.progressPercent}%</span>
            </div>
            <Progress
              value={progress.progressPercent}
              className={cn(
                'h-2',
                progress.isFullyInvoiced
                  ? '[&>div]:bg-green-500'
                  : progress.progressPercent > 0
                    ? '[&>div]:bg-amber-500'
                    : ''
              )}
            />
          </div>

          {/* Amount Summary */}
          <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Billable</p>
              <p className="font-semibold text-sm">{formatCurrency(progress.totalAmount)}</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-xs text-muted-foreground mb-1">Invoiced</p>
              <p className="font-semibold text-sm text-green-600">
                {formatCurrency(progress.invoicedAmount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className={cn(
                'font-semibold text-sm',
                progress.uninvoicedAmount > 0 ? 'text-amber-600' : 'text-muted-foreground'
              )}>
                {formatCurrency(progress.uninvoicedAmount)}
              </p>
            </div>
          </div>

          {/* Breakdown by Type */}
          <div className="space-y-3">
            {/* Labor */}
            {progress.totalLaborItems > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Labor</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.invoicedLaborItems}/{progress.totalLaborItems} entries
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(progress.invoicedLaborAmount)}
                  </p>
                  {progress.uninvoicedLaborAmount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-amber-600 cursor-help">
                          +{formatCurrency(progress.uninvoicedLaborAmount)} pending
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{progress.uninvoicedTimeEntries.length} time entries to invoice</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}

            {/* Materials */}
            {progress.totalMaterialItems > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Materials</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.invoicedMaterialItems}/{progress.totalMaterialItems} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(progress.invoicedMaterialAmount)}
                  </p>
                  {progress.uninvoicedMaterialAmount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-amber-600 cursor-help">
                          +{formatCurrency(progress.uninvoicedMaterialAmount)} pending
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{progress.uninvoicedMaterials.length} materials to invoice</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Summary */}
          {invoices.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  {invoices.length} Invoice{invoices.length !== 1 ? 's' : ''} Created
                </span>
                <span className="font-medium">
                  {formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// Standalone alert component for quick status indication
export function InvoiceProgressAlert({
  serviceCallId,
  className,
}: {
  serviceCallId: string
  className?: string
}) {
  const { getInvoiceProgress } = useData()
  const progress = useMemo(
    () => getInvoiceProgress(serviceCallId),
    [getInvoiceProgress, serviceCallId]
  )

  if (!progress.hasUninvoicedItems) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Uninvoiced items pending
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {progress.uninvoicedTimeEntries.length > 0 && (
            <span>{progress.uninvoicedTimeEntries.length} time entries</span>
          )}
          {progress.uninvoicedTimeEntries.length > 0 && progress.uninvoicedMaterials.length > 0 && (
            <span> and </span>
          )}
          {progress.uninvoicedMaterials.length > 0 && (
            <span>{progress.uninvoicedMaterials.length} materials</span>
          )}
          <span> worth {formatCurrency(progress.uninvoicedAmount)}</span>
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
    </div>
  )
}
