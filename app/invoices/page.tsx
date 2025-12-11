'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InvoiceStatusBadge } from '@/components/invoice/invoice-status-badge'
import { useData } from '@/context/data-context'
import { formatCurrency, formatDate, INVOICE_STATUS_OPTIONS } from '@/lib/constants'
import { Eye } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/types'

export default function InvoicesPage() {
  const router = useRouter()
  const { invoices, customers, serviceCalls, sites } = useData()
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      if (statusFilter !== 'all' && invoice.status !== statusFilter) return false
      if (customerFilter !== 'all' && invoice.customerId !== customerFilter) return false
      return true
    })
  }, [invoices, statusFilter, customerFilter])

  const getCustomerName = (customerId: string) => {
    return customers.find((c) => c.id === customerId)?.name || 'Unknown'
  }

  const getServiceCallTitle = (serviceCallId: string) => {
    return serviceCalls.find((sc) => sc.id === serviceCallId)?.title || 'Unknown'
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Invoices' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {INVOICE_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service Call</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-primary hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {getServiceCallTitle(invoice.serviceCallId)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
