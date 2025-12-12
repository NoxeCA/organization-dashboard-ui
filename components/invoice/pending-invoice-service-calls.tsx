'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useData } from '@/context/data-context'
import { formatCurrency } from '@/lib/constants'
import {
  AlertTriangle,
  Clock,
  Package,
  ArrowRight,
  Briefcase,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingInvoiceServiceCallsProps {
  className?: string
  limit?: number
}

export function PendingInvoiceServiceCalls({
  className,
  limit,
}: PendingInvoiceServiceCallsProps) {
  const { getServiceCallsWithUninvoicedItems, customers, sites } = useData()

  const pendingServiceCalls = useMemo(() => {
    const all = getServiceCallsWithUninvoicedItems()
    return limit ? all.slice(0, limit) : all
  }, [getServiceCallsWithUninvoicedItems, limit])

  const totalPending = useMemo(
    () => pendingServiceCalls.reduce((sum, item) => sum + item.progress.uninvoicedAmount, 0),
    [pendingServiceCalls]
  )

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || 'Unknown Customer'
  }

  const getSiteName = (siteId: string) => {
    return sites.find((s) => s.id === siteId)?.name || ''
  }

  if (pendingServiceCalls.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Service Calls Pending Invoice
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {pendingServiceCalls.length} service call{pendingServiceCalls.length !== 1 ? 's' : ''} with uninvoiced items
            </p>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {formatCurrency(totalPending)} Total Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Service Call</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold text-center">Progress</TableHead>
                <TableHead className="font-semibold text-center">Pending Items</TableHead>
                <TableHead className="font-semibold text-right">Amount</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingServiceCalls.map(({ serviceCall, progress }) => (
                <TableRow key={serviceCall.id} className="group">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <Link
                          href={`/service-calls/${serviceCall.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {serviceCall.title}
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {serviceCall.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{getCustomerName(serviceCall.customerId)}</span>
                    </div>
                    {serviceCall.siteId && (
                      <p className="text-xs text-muted-foreground ml-5.5">
                        {getSiteName(serviceCall.siteId)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center gap-1.5 w-24 mx-auto">
                      <span className="text-xs font-medium">{progress.progressPercent}%</span>
                      <Progress
                        value={progress.progressPercent}
                        className={cn(
                          'h-1.5 w-full',
                          progress.progressPercent > 50
                            ? '[&>div]:bg-green-500'
                            : progress.progressPercent > 0
                              ? '[&>div]:bg-amber-500'
                              : '[&>div]:bg-red-500'
                        )}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      {progress.uninvoicedTimeEntries.length > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span>{progress.uninvoicedTimeEntries.length}</span>
                        </div>
                      )}
                      {progress.uninvoicedMaterials.length > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          <Package className="h-3 w-3 text-emerald-500" />
                          <span>{progress.uninvoicedMaterials.length}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-amber-600">
                      {formatCurrency(progress.uninvoicedAmount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/service-calls/${serviceCall.id}?tab=invoices`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Invoice
                        <ArrowRight className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
