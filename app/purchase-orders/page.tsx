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
import { POStatusBadge } from '@/components/purchase-order/po-status-badge'
import { useData } from '@/context/data-context'
import { formatCurrency, formatDate, PO_STATUS_OPTIONS } from '@/lib/constants'
import { Plus, Eye } from 'lucide-react'
import type { POStatus } from '@/lib/types'

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const { purchaseOrders, suppliers, serviceCalls } = useData()
  const [statusFilter, setStatusFilter] = useState<POStatus | 'all'>('all')
  const [supplierFilter, setSupplierFilter] = useState<string>('all')

  const filteredPurchaseOrders = useMemo(() => {
    return purchaseOrders.filter((po) => {
      if (statusFilter !== 'all' && po.status !== statusFilter) return false
      if (supplierFilter !== 'all' && po.supplierId !== supplierFilter) return false
      return true
    })
  }, [purchaseOrders, statusFilter, supplierFilter])

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name || 'Unknown'
  }

  const getServiceCallTitle = (serviceCallId?: string) => {
    if (!serviceCallId) return '-'
    return serviceCalls.find((sc) => sc.id === serviceCallId)?.title || '-'
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Purchase Orders' },
        ]}
        actions={
          <Button onClick={() => router.push('/purchase-orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New PO
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as POStatus | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {PO_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Related Service Call</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchaseOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No purchase orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/purchase-orders/${po.id}`}
                          className="text-primary hover:underline"
                        >
                          {po.poNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                      <TableCell>
                        <POStatusBadge status={po.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(po.totalAmount)}</TableCell>
                      <TableCell>
                        {po.expectedDelivery ? formatDate(po.expectedDelivery) : '-'}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {getServiceCallTitle(po.serviceCallId)}
                      </TableCell>
                      <TableCell>{formatDate(po.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/purchase-orders/${po.id}`)}
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
