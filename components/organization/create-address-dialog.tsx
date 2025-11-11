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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

const createAddressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  useDefaultEmail: z.boolean().optional(),
  email: z.string().email("Invalid email address").optional(),
}).refine((data) => {
  // Email is required if not using default email
  if (!data.useDefaultEmail && (!data.email || data.email.length === 0)) {
    return false
  }
  return true
}, {
  message: "Email is required when not using default email",
  path: ["email"],
})

type CreateAddressFormValues = z.infer<typeof createAddressSchema>

interface CreateAddressDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreate: (data: CreateAddressFormValues & { type: "billing" | "shipping" }) => void
  type: "billing" | "shipping"
  children?: React.ReactNode
  defaultBillingEmail?: string
  defaultShippingEmail?: string
}

export function CreateAddressDialog({
  open,
  onOpenChange,
  onCreate,
  type,
  children,
  defaultBillingEmail,
  defaultShippingEmail,
}: CreateAddressDialogProps) {
  const [useDefaultEmail, setUseDefaultEmail] = useState(true)
  const defaultEmail = type === "billing" ? defaultBillingEmail : defaultShippingEmail

  const form = useForm<CreateAddressFormValues>({
    resolver: zodResolver(createAddressSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
      useDefaultEmail: true,
      email: "",
    },
  })

  // Reset form when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setUseDefaultEmail(true)
      form.reset({
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        useDefaultEmail: true,
        email: "",
      })
    }
    onOpenChange?.(isOpen)
  }

  const onSubmit = (data: CreateAddressFormValues) => {
    // If using default email, use the default email value
    const finalData = {
      ...data,
      email: data.useDefaultEmail && defaultEmail ? defaultEmail : data.email || "",
      type,
    }
    onCreate(finalData)
    form.reset()
    setUseDefaultEmail(true)
  }

  const addressTypeLabel = type === "billing" ? "Billing" : "Shipping"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create {addressTypeLabel} Address</DialogTitle>
          <DialogDescription>
            Add a new {addressTypeLabel.toLowerCase()} address to your
            organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-default-email"
                  checked={useDefaultEmail}
                  onCheckedChange={(checked) => {
                    setUseDefaultEmail(checked === true)
                    form.setValue("useDefaultEmail", checked === true)
                    if (checked === true) {
                      form.setValue("email", "")
                    }
                  }}
                />
                <label
                  htmlFor="use-default-email"
                  className="text-sm font-medium cursor-pointer leading-none"
                >
                  Use default {type === "billing" ? "billing" : "shipping"} email address
                </label>
              </div>
              {useDefaultEmail && defaultEmail && (
                <div className="ml-6 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {defaultEmail}
                  </p>
                </div>
              )}
              {!useDefaultEmail && (
                <div className="ml-6 mt-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={type === "billing" ? "billing@example.com" : "shipping@example.com"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange?.(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Address</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

