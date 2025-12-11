'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/context/data-context'
import { PRIORITY_OPTIONS, ISSUE_TYPE_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  FileText,
  MapPin,
  Tags,
  AlertCircle,
  Info,
  Sparkles,
  ArrowRight,
  Building2,
  User,
  Phone,
  Wrench,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiceCallFormData } from '@/lib/types'

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  siteId: z.string().min(1, 'Please select a site'),
  requesterName: z.string().min(2, 'Requester name is required'),
  requesterContact: z.string().optional(),
  issueType: z.enum(['network', 'hardware', 'software', 'installation', 'maintenance', 'other']),
  equipmentType: z.string().optional(),
})

const priorityConfig = {
  low: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: null },
  medium: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: null },
  high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertCircle },
  critical: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Zap },
}

export default function NewServiceCallPage() {
  const router = useRouter()
  const { addServiceCall, sites, customers } = useData()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [siteSearchOpen, setSiteSearchOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      siteId: '',
      requesterName: '',
      requesterContact: '',
      issueType: 'other',
      equipmentType: '',
    },
  })

  const watchedPriority = form.watch('priority')
  const watchedSiteId = form.watch('siteId')
  const selectedSite = sites.find((s) => s.id === watchedSiteId)
  const selectedCustomer = selectedSite ? customers.find((c) => c.id === selectedSite.customerId) : null

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const serviceCallData: ServiceCallFormData = {
        title: values.title,
        description: values.description,
        priority: values.priority,
        siteId: values.siteId,
        requesterName: values.requesterName,
        requesterContact: values.requesterContact || undefined,
        issueType: values.issueType,
        equipmentType: values.equipmentType || undefined,
      }

      const newServiceCall = addServiceCall(serviceCallData)

      toast.success('Service call created successfully', {
        description: `Service call ${newServiceCall.id} has been created.`,
      })

      router.push(`/service-calls/${newServiceCall.id}`)
    } catch (error) {
      toast.error('Failed to create service call', {
        description: 'Please try again or contact support if the problem persists.',
      })
      console.error('Error creating service call:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate form completion progress
  const formValues = form.watch()
  const requiredFields = ['title', 'description', 'priority', 'siteId', 'requesterName', 'issueType']
  const completedFields = requiredFields.filter((field) => {
    const value = formValues[field as keyof typeof formValues]
    return value && value.length > 0
  })
  const progress = Math.round((completedFields.length / requiredFields.length) * 100)

  return (
    <TooltipProvider>
      <div className="flex flex-1 flex-col">
        <PageHeader
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service Calls', href: '/service-calls' },
            { label: 'New Service Call' },
          ]}
        />

        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/50 p-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 via-transparent to-transparent" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Create Service Call</h1>
                      <p className="text-sm text-muted-foreground">
                        Fill in the details to create a new service request
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-2xl font-bold">{progress}%</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border-4 border-muted relative">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        className="stroke-primary"
                        strokeWidth="4"
                        strokeDasharray={`${progress * 0.88} 88`}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Basic Information</CardTitle>
                        <CardDescription>
                          Provide the essential details about the service call
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Title
                            <Badge variant="secondary" className="text-xs font-normal">Required</Badge>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief description of the issue (e.g., Network outage at main office)"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Description
                            <Badge variant="secondary" className="text-xs font-normal">Required</Badge>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed description of the issue or request. Include any relevant information that will help technicians understand the problem."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between">
                            <FormMessage />
                            <span className="text-xs text-muted-foreground">
                              {field.value.length} characters
                            </span>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Priority Level
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Priority determines response time:</p>
                                <ul className="mt-1 text-xs space-y-1">
                                  <li><strong>Critical:</strong> Immediate response</li>
                                  <li><strong>High:</strong> Within 4 hours</li>
                                  <li><strong>Medium:</strong> Within 24 hours</li>
                                  <li><strong>Low:</strong> Within 48 hours</li>
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {PRIORITY_OPTIONS.map((option) => {
                              const config = priorityConfig[option.value as keyof typeof priorityConfig]
                              const Icon = config.icon
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => field.onChange(option.value)}
                                  className={cn(
                                    "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all",
                                    field.value === option.value
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-muted hover:border-muted-foreground/50"
                                  )}
                                >
                                  {field.value === option.value && (
                                    <div className="absolute top-2 right-2">
                                      <Check className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                  <div className={cn("rounded-full px-3 py-1 text-xs font-medium", config.color)}>
                                    {Icon && <Icon className="h-3 w-3 inline mr-1" />}
                                    {option.label}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Location & Contact */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Location & Contact</CardTitle>
                        <CardDescription>
                          Specify where the service is needed and who is requesting it
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="siteId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            Site Location
                            <Badge variant="secondary" className="text-xs font-normal">Required</Badge>
                          </FormLabel>
                          <Popover open={siteSearchOpen} onOpenChange={setSiteSearchOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    'h-11 justify-between font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    <div className="flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-muted-foreground" />
                                      {sites.find((site) => site.id === field.value)?.name}
                                    </div>
                                  ) : (
                                    <span>Search and select a site...</span>
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search sites by name or address..." />
                                <CommandList>
                                  <CommandEmpty>
                                    <div className="py-6 text-center">
                                      <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                      <p className="mt-2 text-sm text-muted-foreground">No sites found</p>
                                    </div>
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {sites.map((site) => {
                                      const siteCustomer = customers.find((c) => c.id === site.customerId)
                                      return (
                                        <CommandItem
                                          key={site.id}
                                          value={`${site.name} ${site.address}`}
                                          onSelect={() => {
                                            form.setValue('siteId', site.id)
                                            setSiteSearchOpen(false)
                                          }}
                                          className="py-3"
                                        >
                                          <Check
                                            className={cn(
                                              'mr-3 h-4 w-4 flex-shrink-0',
                                              site.id === field.value ? 'opacity-100' : 'opacity-0'
                                            )}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{site.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                              {site.address}
                                            </p>
                                            {siteCustomer && (
                                              <p className="text-xs text-muted-foreground mt-0.5">
                                                Customer: {siteCustomer.name}
                                              </p>
                                            )}
                                          </div>
                                        </CommandItem>
                                      )
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Selected Site Preview */}
                    {selectedSite && (
                      <div className="p-4 rounded-lg bg-muted/50 border border-dashed space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedSite.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedSite.address}</p>
                          </div>
                        </div>
                        {selectedCustomer && (
                          <>
                            <Separator />
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="requesterName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              Requester Name
                              <Badge variant="secondary" className="text-xs font-normal">Required</Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name of the person requesting service"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requesterContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              Contact Information
                              <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Email or phone number"
                                className="h-11"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              For follow-up questions about this request
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Classification */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Tags className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Classification</CardTitle>
                        <CardDescription>
                          Categorize the type of issue and equipment involved
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={form.control}
                      name="issueType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Issue Type
                            <Badge variant="secondary" className="text-xs font-normal">Required</Badge>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select the type of issue" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ISSUE_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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
                          <FormLabel className="flex items-center gap-2">
                            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                            Equipment Type
                            <Badge variant="outline" className="text-xs font-normal">Optional</Badge>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., IP Camera, Access Control Panel, HVAC System"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Specific equipment or system affected by the issue
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    {completedFields.length === requiredFields.length ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        All required fields completed
                      </span>
                    ) : (
                      <span>
                        {requiredFields.length - completedFields.length} required field(s) remaining
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/service-calls')}
                      disabled={isSubmitting}
                      className="h-11"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-11 min-w-[180px] shadow-lg shadow-primary/25"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Service Call
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
