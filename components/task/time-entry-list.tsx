'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Edit2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { TimeEntryCard } from './time-entry-card'
import {
  formatCurrency,
  formatDate,
  RATE_TYPE_OPTIONS,
  RATE_MULTIPLIERS,
} from '@/lib/constants'
import type { TimeEntry, Employee } from '@/lib/types'
import { cn } from '@/lib/utils'

interface TimeEntryListProps {
  entries: TimeEntry[]
  employees: Employee[]
  onEdit?: (entry: TimeEntry) => void
  onDelete?: (entryId: string) => void
  className?: string
}

export function TimeEntryList({
  entries,
  employees,
  onEdit,
  onDelete,
  className,
}: TimeEntryListProps) {
  const isMobile = useIsMobile()

  const getEmployee = (employeeId: string) =>
    employees.find(e => e.id === employeeId)

  const getEmployeeName = (employeeId: string) =>
    getEmployee(employeeId)?.name || 'Unknown'

  const getRateLabel = (rateType: string) =>
    RATE_TYPE_OPTIONS.find(r => r.value === rateType)?.label || rateType

  const calculateCost = (entry: TimeEntry) => {
    const employee = getEmployee(entry.employeeId)
    if (!employee) return 0
    const multiplier = RATE_MULTIPLIERS[entry.rateType] || 1
    return entry.hours * employee.hourlyRate * multiplier
  }

  if (entries.length === 0) {
    return (
      <div className={cn(
        'text-sm text-muted-foreground text-center py-8 border rounded-md bg-muted/10',
        className
      )}>
        No time entries yet
      </div>
    )
  }

  // Mobile: Card layout
  if (isMobile) {
    return (
      <div className={cn('space-y-3', className)}>
        {entries.map((entry) => (
          <TimeEntryCard
            key={entry.id}
            entry={entry}
            employee={getEmployee(entry.employeeId)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  // Desktop: Table layout
  return (
    <div className={cn('border rounded-md', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-sm">
                {formatDate(entry.date)}
              </TableCell>
              <TableCell className="text-sm">
                {getEmployeeName(entry.employeeId)}
              </TableCell>
              <TableCell className="text-sm">
                {entry.hours}
                {!entry.billable && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    NB
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {getRateLabel(entry.rateType)}
              </TableCell>
              <TableCell className="text-sm">
                {formatCurrency(calculateCost(entry))}
              </TableCell>
              <TableCell className="text-sm max-w-[200px] truncate">
                {entry.notes || '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(entry)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
