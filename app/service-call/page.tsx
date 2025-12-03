"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Clock,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  mockServiceCalls,
  mockEmployees,
} from "@/lib/mock-service-calls";
import { ServiceCallDialog } from "@/components/service-call/service-call-dialog";
import {
  SERVICE_CALL_STATUSES,
  PRIORITIES,
  type ServiceCall,
  type ServiceCallStatus,
  type Priority,
} from "@/lib/types/service-call";

const getStatusBadge = (status: ServiceCallStatus) => {
  const config = SERVICE_CALL_STATUSES.find((s) => s.id === status);
  const variants: Record<ServiceCallStatus, "default" | "secondary" | "destructive" | "outline"> = {
    open: "default",
    in_progress: "secondary",
    resolved: "default",
    invoiced: "outline",
    closed: "secondary",
  };
  return (
    <Badge variant={variants[status]} className="capitalize">
      <span
        className={`mr-1.5 h-2 w-2 rounded-full ${config?.color || "bg-gray-500"}`}
      />
      {config?.name || status}
    </Badge>
  );
};

const getPriorityBadge = (priority: Priority) => {
  const config = PRIORITIES.find((p) => p.id === priority);
  const variants: Record<Priority, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    urgent: "destructive",
  };
  return (
    <Badge variant={variants[priority]} className="capitalize">
      {config?.name || priority}
    </Badge>
  );
};

// Statistics cards
function StatsCards({ serviceCalls }: { serviceCalls: ServiceCall[] }) {
  const openCount = serviceCalls.filter((sc) => sc.status === "open").length;
  const inProgressCount = serviceCalls.filter(
    (sc) => sc.status === "in_progress"
  ).length;
  const urgentCount = serviceCalls.filter((sc) => sc.priority === "urgent").length;
  const resolvedThisMonth = serviceCalls.filter(
    (sc) =>
      sc.status === "resolved" &&
      new Date(sc.updatedAt).getMonth() === new Date().getMonth()
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openCount}</div>
          <p className="text-xs text-muted-foreground">Awaiting action</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressCount}</div>
          <p className="text-xs text-muted-foreground">Being worked on</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Urgent</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{urgentCount}</div>
          <p className="text-xs text-muted-foreground">Require immediate attention</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resolvedThisMonth}</div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Service Call Table Row
function ServiceCallRow({ serviceCall }: { serviceCall: ServiceCall }) {
  const totalTasks = serviceCall.tasks.length;
  const completedTasks = serviceCall.tasks.filter(
    (t) => t.status === "done"
  ).length;

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50">
      <TableCell>
        <Link
          href={`/service-call/${serviceCall.id}`}
          className="flex flex-col gap-1"
        >
          <span className="font-medium">{serviceCall.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {serviceCall.description}
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{serviceCall.customer?.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{serviceCall.site?.name}</span>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(serviceCall.status)}</TableCell>
      <TableCell>{getPriorityBadge(serviceCall.priority)}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span className="text-sm">
            {totalTasks > 0
              ? `${completedTasks}/${totalTasks} tasks`
              : "No tasks"}
          </span>
          {totalTasks > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(completedTasks / totalTasks) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(serviceCall.createdAt), "MMM d, yyyy")}
        </span>
      </TableCell>
      <TableCell>
        <Link href={`/service-call/${serviceCall.id}`}>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

// Card view for service calls
function ServiceCallCard({ serviceCall }: { serviceCall: ServiceCall }) {
  const totalTasks = serviceCall.tasks.length;
  const completedTasks = serviceCall.tasks.filter(
    (t) => t.status === "done"
  ).length;

  return (
    <Link href={`/service-call/${serviceCall.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base line-clamp-1">
                {serviceCall.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {serviceCall.customer?.name}
              </p>
            </div>
            {getPriorityBadge(serviceCall.priority)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {serviceCall.description}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{serviceCall.site?.name}</span>
          </div>

          <div className="flex items-center justify-between">
            {getStatusBadge(serviceCall.status)}
            {totalTasks > 0 && (
              <span className="text-xs text-muted-foreground">
                {completedTasks}/{totalTasks} tasks
              </span>
            )}
          </div>

          {totalTasks > 0 && (
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(completedTasks / totalTasks) * 100}%`,
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>{format(new Date(serviceCall.createdAt), "MMM d, yyyy")}</span>
            {serviceCall.clientPO && <span>PO: {serviceCall.clientPO}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ServiceCallPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [serviceCalls, setServiceCalls] = useState(mockServiceCalls);

  const handleCreateServiceCall = (newServiceCall: Partial<ServiceCall>) => {
    setServiceCalls([newServiceCall as ServiceCall, ...serviceCalls]);
  };

  // Filter service calls
  const filteredServiceCalls = serviceCalls.filter((sc) => {
    const matchesSearch =
      searchQuery === "" ||
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.site?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sc.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || sc.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Service Calls</h1>
            <p className="text-muted-foreground">
              Manage and track all service requests
            </p>
          </div>
          <ServiceCallDialog onServiceCallCreate={handleCreateServiceCall} />
        </div>

        {/* Stats */}
        <StatsCards serviceCalls={serviceCalls} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search service calls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {SERVICE_CALL_STATUSES.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {PRIORITIES.map((priority) => (
                <SelectItem key={priority.id} value={priority.id}>
                  {priority.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle & List */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "table" | "cards")}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredServiceCalls.length} service call
              {filteredServiceCalls.length !== 1 ? "s" : ""}
            </p>
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="cards">Cards</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServiceCalls.map((sc) => (
                    <ServiceCallRow key={sc.id} serviceCall={sc} />
                  ))}
                  {filteredServiceCalls.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No service calls found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServiceCalls.map((sc) => (
                <ServiceCallCard key={sc.id} serviceCall={sc} />
              ))}
              {filteredServiceCalls.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No service calls found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
