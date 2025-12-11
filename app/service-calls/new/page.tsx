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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useData } from '@/context/data-context'
import { PRIORITY_OPTIONS, ISSUE_TYPE_OPTIONS } from '@/lib/constants'
import { toast } from 'sonner'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
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

export default function NewServiceCallPage() {
  const router = useRouter()
  const { addServiceCall, sites } = useData()
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

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Service Calls', href: '/service-calls' },
          { label: 'New Service Call' },
        ]}
      />

      <div className="flex-1 space-y-6 p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about the service call
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief description of the issue" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the issue or request"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
                <CardDescription>
                  Specify where the service is needed and who is requesting it
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Site</FormLabel>
                      <Popover open={siteSearchOpen} onOpenChange={setSiteSearchOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value
                                ? sites.find((site) => site.id === field.value)?.name
                                : 'Select site'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search sites..." />
                            <CommandList>
                              <CommandEmpty>No site found.</CommandEmpty>
                              <CommandGroup>
                                {sites.map((site) => (
                                  <CommandItem
                                    key={site.id}
                                    value={site.name}
                                    onSelect={() => {
                                      form.setValue('siteId', site.id)
                                      setSiteSearchOpen(false)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        site.id === field.value ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{site.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {site.address}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        The location where the service is needed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requesterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requester Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of the person requesting service" {...field} />
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
                      <FormLabel>Requester Contact (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Email or phone number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Contact information for follow-up questions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
                <CardDescription>
                  Categorize the type of issue and equipment involved
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="issueType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
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
                      <FormLabel>Equipment Type (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., IP Camera, Access Control, HVAC" {...field} />
                      </FormControl>
                      <FormDescription>
                        Specific equipment or system affected
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/service-calls')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Service Call
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
