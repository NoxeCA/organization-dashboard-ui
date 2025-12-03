"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Building2, MapPin, FileText, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  type ServiceCall,
  type Customer,
  type Site,
  type Priority,
  PRIORITIES,
} from "@/lib/types/service-call";
import { mockCustomers, mockSites } from "@/lib/mock-service-calls";

const serviceCallFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  customerId: z.string().min(1, "Customer is required"),
  siteId: z.string().min(1, "Site is required"),
  issueType: z.string().optional(),
  equipmentType: z.string().optional(),
  startDate: z.date(),
  clientPO: z.string().optional(),
});

type ServiceCallFormValues = z.infer<typeof serviceCallFormSchema>;

const ISSUE_TYPES = [
  "Network",
  "Installation",
  "Maintenance",
  "Troubleshooting",
  "Emergency Repair",
  "Configuration",
  "Upgrade",
  "Other",
];

const EQUIPMENT_TYPES = [
  "Switch",
  "Router",
  "Camera",
  "NVR",
  "UPS",
  "Access Control",
  "Fiber",
  "Server",
  "Workstation",
  "Other",
];

interface ServiceCallDialogProps {
  onServiceCallCreate?: (serviceCall: Partial<ServiceCall>) => void;
  trigger?: React.ReactNode;
}

export function ServiceCallDialog({
  onServiceCallCreate,
  trigger,
}: ServiceCallDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Filter sites based on selected customer
  const availableSites = selectedCustomerId
    ? mockSites.filter((site) => site.customerId === selectedCustomerId)
    : [];

  const form = useForm<ServiceCallFormValues>({
    resolver: zodResolver(serviceCallFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      customerId: "",
      siteId: "",
      issueType: "",
      equipmentType: "",
      startDate: new Date(),
      clientPO: "",
    },
  });

  const onSubmit = (data: ServiceCallFormValues) => {
    const customer = mockCustomers.find((c) => c.id === data.customerId);
    const site = mockSites.find((s) => s.id === data.siteId);

    const newServiceCall: Partial<ServiceCall> = {
      id: `sc-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: "open",
      priority: data.priority,
      customerId: data.customerId,
      customer,
      siteId: data.siteId,
      site,
      issueType: data.issueType,
      equipmentType: data.equipmentType,
      startDate: data.startDate.toISOString().split("T")[0],
      clientPO: data.clientPO,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      summary: {
        predictedMaterial: 0,
        estimatedSellPrice: 0,
        estimatedCost: 0,
        realCost: 0,
        realSellPrice: 0,
      },
    };

    onServiceCallCreate?.(newServiceCall);
    form.reset();
    setSelectedCustomerId("");
    setOpen(false);
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    form.setValue("customerId", customerId);
    form.setValue("siteId", ""); // Reset site when customer changes
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Service Call
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service Call</DialogTitle>
          <DialogDescription>
            Create a new service call to track maintenance or configuration work.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Network Connectivity Issues - Server Room"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue or work required in detail..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer and Site */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Customer
                    </FormLabel>
                    <Select
                      onValueChange={handleCustomerChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Site
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCustomerId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedCustomerId
                                ? "Select site"
                                : "Select customer first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            <div className="flex flex-col">
                              <span>{site.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {site.city}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority and Start Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Priority
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.id} value={priority.id}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2 w-2 rounded-full ${priority.color}`}
                              />
                              {priority.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Issue Type and Equipment Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ISSUE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EQUIPMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client PO */}
            <FormField
              control={form.control}
              name="clientPO"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Client PO (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PO-2024-0142" {...field} />
                  </FormControl>
                  <FormDescription>
                    Purchase order number from the client, if available.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Service Call</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
