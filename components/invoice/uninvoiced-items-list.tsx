'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useData, type InvoiceProgressData } from '@/context/data-context'
import { formatCurrency, formatDate } from '@/lib/constants'
import {
  Clock,
  Package,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UninvoicedItemsListProps {
  serviceCallId: string
  className?: string
}

export function UninvoicedItemsList({
  serviceCallId,
  className,
}: UninvoicedItemsListProps) {
  const { getInvoiceProgress } = useData()

  const progress = useMemo(
    () => getInvoiceProgress(serviceCallId),
    [getInvoiceProgress, serviceCallId]
  )

  if (!progress.hasUninvoicedItems) {
    return null
  }

  return (
    <Card className={cn('border-amber-200 dark:border-amber-800', className)}>
      <CardHeader className="pb-3 pt-4 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Pending Invoice Items
          </CardTitle>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {formatCurrency(progress.uninvoicedAmount)} Total
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          The following items from completed tasks have not yet been invoiced
        </p>
      </CardHeader>
      <CardContent className="pb-4 pt-2">
        <Accordion type="multiple" defaultValue={['labor', 'materials']} className="space-y-2">
          {/* Labor Items */}
          {progress.uninvoicedTimeEntries.length > 0 && (
            <AccordionItem value="labor" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Labor Time Entries</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.uninvoicedTimeEntries.length} entries - {formatCurrency(progress.uninvoicedLaborAmount)}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="border-t">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">Task</TableHead>
                        <TableHead className="text-xs">Employee</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs text-center">Hours</TableHead>
                        <TableHead className="text-xs text-center">Rate</TableHead>
                        <TableHead className="text-xs text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {progress.uninvoicedTimeEntries.map((entry) => (
                        <TableRow key={entry.id} className="text-sm">
                          <TableCell className="font-medium max-w-[150px] truncate">
                            {entry.taskTitle}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{entry.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{formatDate(entry.date)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs font-medium">{entry.hours}h</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 capitalize">
                              {entry.rateType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(entry.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Material Items */}
          {progress.uninvoicedMaterials.length > 0 && (
            <AccordionItem value="materials" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Materials</p>
                    <p className="text-xs text-muted-foreground">
                      {progress.uninvoicedMaterials.length} items - {formatCurrency(progress.uninvoicedMaterialAmount)}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="border-t">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">Material</TableHead>
                        <TableHead className="text-xs">Task</TableHead>
                        <TableHead className="text-xs text-center">Quantity</TableHead>
                        <TableHead className="text-xs text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {progress.uninvoicedMaterials.map((material) => (
                        <TableRow key={material.id} className="text-sm">
                          <TableCell className="font-medium">
                            {material.materialName}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-muted-foreground">
                            {material.taskTitle}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs">
                              {material.quantity} {material.unit}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(material.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}
