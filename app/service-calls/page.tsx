'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, PriorityBadge } from '@/components/service-call/status-badge'
import { useData } from '@/context/data-context'
import { SERVICE_CALL_STATUS_OPTIONS, PRIORITY_OPTIONS, formatDate } from '@/lib/constants'
import {
  Plus,
  Search,
  ClipboardList,
  MoreHorizontal,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  XCircle,
  Filter,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  Receipt,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiceCallStatus, ServiceCallPriority } from '@/lib/types'

export default function ServiceCallsPage() {
  const router = useRouter()
  const { serviceCalls, sites, getTasksForServiceCall, getInvoiceProgress } = useData()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ServiceCallStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<ServiceCallPriority | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'priority'>('newest')

  // Calculate stats
  const stats = useMemo(() => {
    const open = serviceCalls.filter((sc) => sc.status === 'open').length
    const inProgress = serviceCalls.filter((sc) => sc.status === 'in_progress').length
    const resolved = serviceCalls.filter((sc) => sc.status === 'resolved').length
    const critical = serviceCalls.filter((sc) => sc.priority === 'critical').length
    return { open, inProgress, resolved, critical, total: serviceCalls.length }
  }, [serviceCalls])

  const filteredServiceCalls = useMemo(() => {
    let result = serviceCalls.filter((sc) => {
      const matchesSearch =
        sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || sc.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || sc.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort results
    result = [...result].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortOrder === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
    })

    return result
  }, [serviceCalls, searchQuery, statusFilter, priorityFilter, sortOrder])

  const getSiteName = (siteId: string) => {
    return sites.find((s) => s.id === siteId)?.name || siteId
  }

  const getTaskProgress = (serviceCallId: string) => {
    const tasks = getTasksForServiceCall(serviceCallId)
    if (tasks.length === 0) return null
    const completed = tasks.filter((t) => t.status === 'completed').length
    return { completed, total: tasks.length }
  }

  const statusIcons: Record<ServiceCallStatus, React.ReactNode> = {
    open: <Clock className="h-4 w-4" />,
    in_progress: <TrendingUp className="h-4 w-4" />,
    resolved: <CheckCircle2 className="h-4 w-4" />,
    invoiced: <FileText className="h-4 w-4" />,
    closed: <XCircle className="h-4 w-4" />,
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPriorityFilter('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service Calls' },
          ]}
          actions={
            <Button asChild className="shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
              <Link href="/service-calls/new">
                <Plus className="mr-2 h-4 w-4" />
                New Service Call
              </Link>
            </Button>
          }
        />

        <div className="flex-1 space-y-6 p-6">
          {/* Stats Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5",
                statusFilter === 'open' && "ring-2 ring-blue-500"
              )}
              onClick={() => setStatusFilter(statusFilter === 'open' ? 'all' : 'open')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.open}</p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Awaiting action</p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5",
                statusFilter === 'in_progress' && "ring-2 ring-amber-500"
              )}
              onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.inProgress}</p>
                  </div>
                  <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
                    <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Currently being worked on</p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5",
                statusFilter === 'resolved' && "ring-2 ring-green-500"
              )}
              onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Ready for invoicing</p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5",
                priorityFilter === 'critical' && "ring-2 ring-red-500"
              )}
              onClick={() => setPriorityFilter(priorityFilter === 'critical' ? 'all' : 'critical')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
                  </div>
                  <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Requires immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-muted-foreground mr-1">Status:</span>
                <Badge
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </Badge>
                {SERVICE_CALL_STATUS_OPTIONS.slice(0, 3).map((option) => (
                  <Tooltip key={option.value}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={statusFilter === option.value ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => setStatusFilter(option.value)}
                      >
                        {statusIcons[option.value]}
                        <span className="ml-1">{option.label}</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Filter by {option.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <div className="h-6 w-px bg-border hidden sm:block" />

              {/* Priority Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Priority
                    {priorityFilter !== 'all' && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setPriorityFilter('all')}>
                    <span className={cn(priorityFilter === 'all' && 'font-semibold')}>All Priorities</span>
                  </DropdownMenuItem>
                  {PRIORITY_OPTIONS.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setPriorityFilter(option.value)}>
                      <span className={cn(priorityFilter === option.value && 'font-semibold')}>
                        {option.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                    <span className={cn(sortOrder === 'newest' && 'font-semibold')}>Newest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                    <span className={cn(sortOrder === 'oldest' && 'font-semibold')}>Oldest First</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('priority')}>
                    <span className={cn(sortOrder === 'priority' && 'font-semibold')}>Priority (High to Low)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-muted-foreground">
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[140px] font-semibold">ID</TableHead>
                    <TableHead className="min-w-[250px] font-semibold">Service Call</TableHead>
                    <TableHead className="font-semibold">Site</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Tasks</TableHead>
                    <TableHead className="font-semibold">Invoicing</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServiceCalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-[400px]">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
                            <div className="relative rounded-full bg-muted p-6">
                              <ClipboardList className="h-10 w-10 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="text-center max-w-sm">
                            <h3 className="text-lg font-semibold">No service calls found</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {hasActiveFilters
                                ? "Try adjusting your search or filters to find what you're looking for"
                                : "Get started by creating your first service call"}
                            </p>
                          </div>
                          {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                              Clear all filters
                            </Button>
                          ) : (
                            <Button asChild>
                              <Link href="/service-calls/new">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Create your first service call
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServiceCalls.map((sc) => {
                      const taskProgress = getTaskProgress(sc.id)
                      const invoiceProgressData = ['resolved', 'invoiced', 'closed'].includes(sc.status)
                        ? getInvoiceProgress(sc.id)
                        : null
                      return (
                        <TableRow
                          key={sc.id}
                          className="group cursor-pointer transition-colors"
                          onClick={() => router.push(`/service-calls/${sc.id}`)}
                        >
                          <TableCell>
                            <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
                              {sc.id}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium group-hover:text-primary transition-colors">
                                {sc.title}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-1 max-w-[250px]">
                                {sc.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{getSiteName(sc.siteId)}</span>
                          </TableCell>
                          <TableCell>
                            <PriorityBadge priority={sc.priority} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sc.status} />
                          </TableCell>
                          <TableCell>
                            {taskProgress ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-primary transition-all"
                                        style={{
                                          width: `${(taskProgress.completed / taskProgress.total) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {taskProgress.completed}/{taskProgress.total}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {taskProgress.completed} of {taskProgress.total} tasks completed
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {invoiceProgressData ? (
                              invoiceProgressData.totalAmount > 0 ? (
                                invoiceProgressData.hasUninvoicedItems ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Pending
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {invoiceProgressData.progressPercent}% invoiced
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Complete
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Fully invoiced
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              ) : (
                                <span className="text-xs text-muted-foreground">No billable items</span>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(sc.createdAt)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                Created on {new Date(sc.createdAt).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(`/service-calls/${sc.id}`)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigator.clipboard.writeText(sc.id)
                                  }}
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Copy ID
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Footer Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing <span className="font-medium text-foreground">{filteredServiceCalls.length}</span> of{' '}
              <span className="font-medium text-foreground">{serviceCalls.length}</span> service calls
            </p>
            {hasActiveFilters && (
              <p className="text-xs">
                Filters applied:{' '}
                {[
                  searchQuery && 'search',
                  statusFilter !== 'all' && 'status',
                  priorityFilter !== 'all' && 'priority',
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
