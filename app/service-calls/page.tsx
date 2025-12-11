'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { StatusBadge, PriorityBadge } from '@/components/service-call/status-badge'
import { useData } from '@/context/data-context'
import { SERVICE_CALL_STATUS_OPTIONS, PRIORITY_OPTIONS, formatDate } from '@/lib/constants'
import { Plus, Search } from 'lucide-react'
import type { ServiceCallStatus, ServiceCallPriority } from '@/lib/types'

export default function ServiceCallsPage() {
  const router = useRouter()
  const { serviceCalls, sites } = useData()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ServiceCallStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<ServiceCallPriority | 'all'>('all')

  const filteredServiceCalls = useMemo(() => {
    return serviceCalls.filter((sc) => {
      const matchesSearch =
        sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || sc.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || sc.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [serviceCalls, searchQuery, statusFilter, priorityFilter])

  const getSiteName = (siteId: string) => {
    return sites.find((s) => s.id === siteId)?.name || siteId
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Service Calls' },
        ]}
        actions={
          <Button asChild>
            <Link href="/service-calls/new">
              <Plus className="mr-2 h-4 w-4" />
              New Service Call
            </Link>
          </Button>
        }
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search service calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ServiceCallStatus | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {SERVICE_CALL_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as ServiceCallPriority | 'all')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServiceCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No service calls found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServiceCalls.map((sc) => (
                  <TableRow
                    key={sc.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/service-calls/${sc.id}`)}
                  >
                    <TableCell className="font-medium">{sc.id}</TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <div className="font-medium">{sc.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {sc.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getSiteName(sc.siteId)}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={sc.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={sc.status} />
                    </TableCell>
                    <TableCell>{formatDate(sc.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/service-calls/${sc.id}`)
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredServiceCalls.length} of {serviceCalls.length} service calls
        </div>
      </div>
    </div>
  )
}
