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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import type { Site } from "./sites-management"
import type { Address } from "./addresses-management"

const createSiteSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  billingAddressId: z.string().optional(),
  shippingAddressId: z.string().optional(),
  // New address fields for inline creation
  newBillingAddress: z.string().optional(),
  newBillingCity: z.string().optional(),
  newBillingState: z.string().optional(),
  newBillingZipCode: z.string().optional(),
  newBillingCountry: z.string().optional(),
  newShippingAddress: z.string().optional(),
  newShippingCity: z.string().optional(),
  newShippingState: z.string().optional(),
  newShippingZipCode: z.string().optional(),
  newShippingCountry: z.string().optional(),
})

type CreateSiteFormValues = z.infer<typeof createSiteSchema>

interface CreateSiteDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCreate: (data: CreateSiteFormValues) => void
  onUpdate?: (id: string, data: CreateSiteFormValues) => void
  site?: Site | null
  children?: React.ReactNode
  billingAddresses: Address[]
  shippingAddresses: Address[]
  defaultBillingAddressId: string
  defaultShippingAddressId: string
}

type AddressOption = "default" | "existing" | "new"

export function CreateSiteDialog({
  open,
  onOpenChange,
  onCreate,
  onUpdate,
  site,
  children,
  billingAddresses,
  shippingAddresses,
  defaultBillingAddressId,
  defaultShippingAddressId,
}: CreateSiteDialogProps) {
  const isEditMode = !!site
  const [billingOption, setBillingOption] = useState<AddressOption>("default")
  const [shippingOption, setShippingOption] = useState<AddressOption>("default")

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
      newBillingAddress: "",
      newBillingCity: "",
      newBillingState: "",
      newBillingZipCode: "",
      newBillingCountry: "USA",
      newShippingAddress: "",
      newShippingCity: "",
      newShippingState: "",
      newShippingZipCode: "",
      newShippingCountry: "USA",
    },
  })

  // Prefill form when editing
  useEffect(() => {
    if (site && open) {
      const currentBillingOption = site.billingAddressId
        ? site.billingAddressId === defaultBillingAddressId
          ? "default"
          : "existing"
        : "new"
      const currentShippingOption = site.shippingAddressId
        ? site.shippingAddressId === defaultShippingAddressId
          ? "default"
          : "existing"
        : "new"

      setBillingOption(currentBillingOption)
      setShippingOption(currentShippingOption)

      form.reset({
        name: site.name,
        address: site.address,
        city: site.city,
        state: site.state,
        zipCode: site.zipCode,
        country: site.country,
        billingAddressId: site.billingAddressId,
        shippingAddressId: site.shippingAddressId,
        newBillingAddress: "",
        newBillingCity: "",
        newBillingState: "",
        newBillingZipCode: "",
        newBillingCountry: "USA",
        newShippingAddress: "",
        newShippingCity: "",
        newShippingState: "",
        newShippingZipCode: "",
        newShippingCountry: "USA",
      })
    } else if (!site && open) {
      // Reset form for create mode
      setBillingOption("default")
      setShippingOption("default")
      form.reset({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        billingAddressId: undefined,
        shippingAddressId: undefined,
        newBillingAddress: "",
        newBillingCity: "",
        newBillingState: "",
        newBillingZipCode: "",
        newBillingCountry: "USA",
        newShippingAddress: "",
        newShippingCity: "",
        newShippingState: "",
        newShippingZipCode: "",
        newShippingCountry: "USA",
      })
    }
  }, [site, open, form, defaultBillingAddressId, defaultShippingAddressId])

  const onSubmit = (data: CreateSiteFormValues) => {
    // Validate new address fields if "new" option is selected
    if (billingOption === "new") {
      if (!data.newBillingAddress || !data.newBillingCity || !data.newBillingState || !data.newBillingZipCode || !data.newBillingCountry) {
        form.setError("newBillingAddress", { message: "All billing address fields are required when creating a new address" })
        return
      }
      data.billingAddressId = undefined
    } else if (billingOption === "default") {
      data.billingAddressId = defaultBillingAddressId
    }
    // else billingOption === "existing" - billingAddressId is already set from form

    if (shippingOption === "new") {
      if (!data.newShippingAddress || !data.newShippingCity || !data.newShippingState || !data.newShippingZipCode || !data.newShippingCountry) {
        form.setError("newShippingAddress", { message: "All shipping address fields are required when creating a new address" })
        return
      }
      data.shippingAddressId = undefined
    } else if (shippingOption === "default") {
      data.shippingAddressId = defaultShippingAddressId
    }
    // else shippingOption === "existing" - shippingAddressId is already set from form

    if (isEditMode && site && onUpdate) {
      onUpdate(site.id, data)
    } else {
      onCreate(data)
    }
    if (!isEditMode) {
      form.reset()
      setBillingOption("default")
      setShippingOption("default")
    }
  }

  const formatAddress = (addr: Address) => {
    return `${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}`
  }

  const defaultBillingAddress = billingAddresses.find((a) => a.id === defaultBillingAddressId)
  const defaultShippingAddress = shippingAddresses.find((a) => a.id === defaultShippingAddressId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Site" : "Create New Site"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update site information. Choose how to handle billing and shipping addresses."
              : "Add a new site to your organization. Choose how to handle billing and shipping addresses."}
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
              
              {isEditMode && site?.billingAddress && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Current Billing Address</p>
                  <p className="text-sm">{site.billingAddress}</p>
                </div>
              )}

              <RadioGroup
                value={billingOption}
                onValueChange={(value) => {
                  setBillingOption(value as AddressOption)
                  if (value === "default") {
                    form.setValue("billingAddressId", undefined)
                  } else if (value === "existing" && billingAddresses.length > 0) {
                    form.setValue("billingAddressId", billingAddresses[0].id)
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="billing-default" />
                  <label htmlFor="billing-default" className="text-sm font-medium cursor-pointer">
                    Use default address
                  </label>
                </div>
                {billingOption === "default" && defaultBillingAddress && (
                  <div className="ml-6 mb-2">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        This site will use the organization's default billing address: {formatAddress(defaultBillingAddress)}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="billing-existing" />
                  <label htmlFor="billing-existing" className="text-sm font-medium cursor-pointer">
                    Use existing address
                  </label>
                </div>
                {billingOption === "existing" && (
                  <div className="ml-6">
                    <FormField
                      control={form.control}
                      name="billingAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Billing Address</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an address" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {billingAddresses.map((addr) => (
                                <SelectItem key={addr.id} value={addr.id}>
                                  {formatAddress(addr)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="billing-new" />
                  <label htmlFor="billing-new" className="text-sm font-medium cursor-pointer">
                    Create new address
                  </label>
                </div>
                {billingOption === "new" && (
                  <div className="ml-6 space-y-4 border-l-2 pl-4">
                    <FormField
                      control={form.control}
                      name="newBillingAddress"
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
                        name="newBillingCity"
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
                        name="newBillingState"
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
                        name="newBillingZipCode"
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
                        name="newBillingCountry"
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
                )}
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Shipping Address</h3>
              
              {isEditMode && site?.shippingAddress && (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Current Shipping Address</p>
                  <p className="text-sm">{site.shippingAddress}</p>
                </div>
              )}

              <RadioGroup
                value={shippingOption}
                onValueChange={(value) => {
                  setShippingOption(value as AddressOption)
                  if (value === "default") {
                    form.setValue("shippingAddressId", undefined)
                  } else if (value === "existing" && shippingAddresses.length > 0) {
                    form.setValue("shippingAddressId", shippingAddresses[0].id)
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="shipping-default" />
                  <label htmlFor="shipping-default" className="text-sm font-medium cursor-pointer">
                    Use default address
                  </label>
                </div>
                {shippingOption === "default" && defaultShippingAddress && (
                  <div className="ml-6 mb-2">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        This site will use the organization's default shipping address: {formatAddress(defaultShippingAddress)}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="shipping-existing" />
                  <label htmlFor="shipping-existing" className="text-sm font-medium cursor-pointer">
                    Use existing address
                  </label>
                </div>
                {shippingOption === "existing" && (
                  <div className="ml-6">
                    <FormField
                      control={form.control}
                      name="shippingAddressId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Shipping Address</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an address" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {shippingAddresses.map((addr) => (
                                <SelectItem key={addr.id} value={addr.id}>
                                  {formatAddress(addr)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="shipping-new" />
                  <label htmlFor="shipping-new" className="text-sm font-medium cursor-pointer">
                    Create new address
                  </label>
                </div>
                {shippingOption === "new" && (
                  <div className="ml-6 space-y-4 border-l-2 pl-4">
                    <FormField
                      control={form.control}
                      name="newShippingAddress"
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
                        name="newShippingCity"
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
                        name="newShippingState"
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
                        name="newShippingZipCode"
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
                        name="newShippingCountry"
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
                )}
              </RadioGroup>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setBillingOption("default")
                  setShippingOption("default")
                  onOpenChange?.(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Update Site" : "Create Site"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
