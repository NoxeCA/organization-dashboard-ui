'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { InvoiceAgingChart } from '@/components/invoice/invoice-aging-chart'
import { PendingInvoiceServiceCalls } from '@/components/invoice/pending-invoice-service-calls'
import { useData } from '@/context/data-context'
import { formatCurrency, formatDate, INVOICE_STATUS_OPTIONS } from '@/lib/constants'
import { Eye, DollarSign, AlertTriangle, CheckCircle, FileText, TrendingUp, Clock } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/types'

export default function InvoicesPage() {
  const router = useRouter()
  const { invoices, customers, serviceCalls } = useData()
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState<string>('all')

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Group invoices by currency for accurate totals
    const byCurrency: Record<string, {
      outstanding: number
      overdue: number
      paidThisMonth: number
      draft: number
    }> = {}

    invoices.forEach((invoice) => {
      const currency = invoice.currency || 'USD'
      if (!byCurrency[currency]) {
        byCurrency[currency] = { outstanding: 0, overdue: 0, paidThisMonth: 0, draft: 0 }
      }

      // Outstanding: sent, partially_paid, overdue
      if (['sent', 'partially_paid', 'overdue'].includes(invoice.status)) {
        byCurrency[currency].outstanding += invoice.amountDue
      }

      // Overdue
      if (invoice.status === 'overdue') {
        byCurrency[currency].overdue += invoice.amountDue
      }

      // Paid this month
      if (invoice.status === 'paid' && invoice.paidDate) {
        const paidDate = new Date(invoice.paidDate)
        if (paidDate >= startOfMonth) {
          byCurrency[currency].paidThisMonth += invoice.totalAmount
        }
      }

      // Draft
      if (invoice.status === 'draft') {
        byCurrency[currency].draft += invoice.totalAmount
      }
    })

    // For display, we'll show USD totals (primary currency)
    // In a real app, you might want to convert or show multiple currencies
    const usd = byCurrency['USD'] || { outstanding: 0, overdue: 0, paidThisMonth: 0, draft: 0 }

    return {
      outstanding: usd.outstanding,
      overdue: usd.overdue,
      paidThisMonth: usd.paidThisMonth,
      draft: usd.draft,
      totalInvoices: invoices.length,
      overdueCount: invoices.filter(i => i.status === 'overdue').length,
    }
  }, [invoices])

  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) => {
        if (statusFilter !== 'all' && invoice.status !== statusFilter) return false
        if (customerFilter !== 'all' && invoice.customerId !== customerFilter) return false
        return true
      })
      .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
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
          {/* Dashboard Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.outstanding)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.overdue)}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics.overdueCount} invoice{metrics.overdueCount !== 1 ? 's' : ''} overdue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.paidThisMonth)}</div>
                <p className="text-xs text-muted-foreground">
                  Collected this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics.draft)}</div>
                <p className="text-xs text-muted-foreground">
                  Ready to send
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Aging & Pending Service Calls */}
          <div className="grid gap-6 lg:grid-cols-2">
            <InvoiceAgingChart />
            <PendingInvoiceServiceCalls limit={5} />
          </div>

          {/* Filters */}
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

          {/* Invoice Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service Call</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Amount Due</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground">
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
                      <TableCell className="max-w-[200px] truncate">
                        {getServiceCallTitle(invoice.serviceCallId)}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.amountDue > 0 ? (
                          <span className={invoice.status === 'overdue' ? 'text-orange-600 font-medium' : ''}>
                            {formatCurrency(invoice.amountDue, invoice.currency)}
                          </span>
                        ) : (
                          <span className="text-green-600">Paid</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issuedDate)}</TableCell>
                      <TableCell>
                        <span className={invoice.status === 'overdue' ? 'text-orange-600' : ''}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </TableCell>
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
