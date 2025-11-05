"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

const createSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  billingAddressId: z.string().optional(),
  shippingAddressId: z.string().optional(),
})

type CreateSiteFormValues = z.infer<typeof createSiteSchema>

interface CreateSiteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreate: (data: CreateSiteFormValues) => void
  children?: React.ReactNode
}

// Mock addresses for selection
const mockBillingAddresses = [
  { id: "1", label: "123 Main St, New York, NY 10001" },
  { id: "2", label: "456 Corporate Ave, New York, NY 10002" },
]

const mockShippingAddresses = [
  { id: "1", label: "123 Main St, New York, NY 10001" },
  { id: "2", label: "456 Industrial Blvd, Los Angeles, CA 90001" },
]

export function CreateSiteDialog({
  open,
  onOpenChange,
  onCreate,
  children,
}: CreateSiteDialogProps) {
  const [useExistingBilling, setUseExistingBilling] = useState(false)
  const [useExistingShipping, setUseExistingShipping] = useState(false)

  const form = useForm<CreateSiteFormValues>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      billingAddressId: undefined,
      shippingAddressId: undefined,
    },
  })

  const onSubmit = (data: CreateSiteFormValues) => {
    onCreate(data)
    form.reset()
    setUseExistingBilling(false)
    setUseExistingShipping(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Site</DialogTitle>
          <DialogDescription>
            Add a new site to your organization. You can link existing billing
            and shipping addresses or create new ones.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Office" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Site Location</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Billing Address</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-existing-billing"
                  checked={useExistingBilling}
                  onChange={(e) => {
                    setUseExistingBilling(e.target.checked)
                    if (!e.target.checked) {
                      form.setValue("billingAddressId", undefined)
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="use-existing-billing"
                  className="text-sm font-medium cursor-pointer"
                >
                  Use existing billing address
                </label>
              </div>

              {useExistingBilling ? (
                <FormField
                  control={form.control}
                  name="billingAddressId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Billing Address</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an address" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockBillingAddresses.map((addr) => (
                            <SelectItem key={addr.id} value={addr.id}>
                              {addr.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  A new billing address will be created using the site location
                  information.
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Shipping Address</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-existing-shipping"
                  checked={useExistingShipping}
                  onChange={(e) => {
                    setUseExistingShipping(e.target.checked)
                    if (!e.target.checked) {
                      form.setValue("shippingAddressId", undefined)
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor="use-existing-shipping"
                  className="text-sm font-medium cursor-pointer"
                >
                  Use existing shipping address
                </label>
              </div>

              {useExistingShipping ? (
                <FormField
                  control={form.control}
                  name="shippingAddressId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Shipping Address</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an address" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockShippingAddresses.map((addr) => (
                            <SelectItem key={addr.id} value={addr.id}>
                              {addr.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  A new shipping address will be created using the site location
                  information.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setUseExistingBilling(false)
                  setUseExistingShipping(false)
                  onOpenChange?.(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Site</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

