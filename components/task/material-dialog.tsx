'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/context/data-context'
import { MATERIAL_SOURCE_OPTIONS, UNIT_OPTIONS } from '@/lib/constants'
import type { Task } from '@/lib/types'

const materialFormSchema = z.object({
  materialName: z.string().min(1, 'Material name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unitCost: z.number().positive('Unit cost must be positive').optional().or(z.literal(undefined)),
  source: z.enum(['stock', 'purchased', 'customer_provided']),
  purchaseOrderId: z.string().optional(),
})

type MaterialFormValues = z.infer<typeof materialFormSchema>

interface MaterialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
}

export function MaterialDialog({ open, onOpenChange, task }: MaterialDialogProps) {
  const { addMaterialUsage, purchaseOrders, getServiceCall } = useData()

  // Get service call to filter relevant purchase orders
  const serviceCall = getServiceCall(task.serviceCallId)
  const relevantPOs = purchaseOrders.filter(
    po => po.serviceCallId === task.serviceCallId && po.status !== 'cancelled'
  )

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      materialName: '',
      quantity: undefined,
      unit: 'pcs',
      unitCost: undefined,
      source: 'stock',
      purchaseOrderId: undefined,
    },
  })

  const watchSource = form.watch('source')

  const onSubmit = (data: MaterialFormValues) => {
    try {
      addMaterialUsage(task.id, data)
      toast.success('Material added successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Material</DialogTitle>
          <DialogDescription>
            Add material usage for {task.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="materialName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CAT6 Network Cable" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g., 10"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? undefined : parseFloat(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_OPTIONS.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Cost</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 25.50"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === '' ? undefined : parseFloat(val))
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Enter the cost per unit (USD)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MATERIAL_SOURCE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Where did this material come from?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchSource === 'purchased' && relevantPOs.length > 0 && (
              <FormField
                control={form.control}
                name="purchaseOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purchase order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {relevantPOs.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.poNumber} - {po.status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional: Link to a purchase order
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add Material
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
