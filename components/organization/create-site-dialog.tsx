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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Info, CreditCard, Package, Mail } from "lucide-react"
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
  // Email fields
  useDefaultBillingEmail: z.boolean().optional(),
  useDefaultShippingEmail: z.boolean().optional(),
  billingEmail: z.string().email("Invalid email address").optional(),
  shippingEmail: z.string().email("Invalid email address").optional(),
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
  defaultBillingEmail: string
  defaultShippingEmail: string
}

type AddressOption = "keep-current" | "default" | "existing" | "new"

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
  defaultBillingEmail,
  defaultShippingEmail,
}: CreateSiteDialogProps) {
  const isEditMode = !!site
  const getInitialBillingOption = (): AddressOption => {
    if (isEditMode && site?.billingAddress) return "keep-current"
    return "default"
  }
  const getInitialShippingOption = (): AddressOption => {
    if (isEditMode && site?.shippingAddress) return "keep-current"
    return "default"
  }
  const [billingOption, setBillingOption] = useState<AddressOption>(getInitialBillingOption)
  const [shippingOption, setShippingOption] = useState<AddressOption>(getInitialShippingOption)
  const [useDefaultBillingEmail, setUseDefaultBillingEmail] = useState(true)
  const [useDefaultShippingEmail, setUseDefaultShippingEmail] = useState(true)

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
      useDefaultBillingEmail: true,
      useDefaultShippingEmail: true,
      billingEmail: "",
      shippingEmail: "",
    },
  })

  // Prefill form when editing or reset when creating
  useEffect(() => {
    if (!open) return

    if (site) {
      // When editing, populate with site data
      const billingEmailDefault = !site.billingEmail || site.billingEmail === defaultBillingEmail
      const shippingEmailDefault = !site.shippingEmail || site.shippingEmail === defaultShippingEmail
      
      // Use queueMicrotask to avoid setState during render
      queueMicrotask(() => {
        setUseDefaultBillingEmail(billingEmailDefault)
        setUseDefaultShippingEmail(shippingEmailDefault)
      })
      
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
        useDefaultBillingEmail: billingEmailDefault,
        useDefaultShippingEmail: shippingEmailDefault,
        billingEmail: site.billingEmail || "",
        shippingEmail: site.shippingEmail || "",
      })
    } else {
      // Reset form for create mode
      queueMicrotask(() => {
        setUseDefaultBillingEmail(true)
        setUseDefaultShippingEmail(true)
      })
      
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
        useDefaultBillingEmail: true,
        useDefaultShippingEmail: true,
        billingEmail: "",
        shippingEmail: "",
      })
    }
  }, [site, open, form, defaultBillingEmail, defaultShippingEmail])

  const onSubmit = (data: CreateSiteFormValues) => {
    // Handle billing address based on selected option
    if (billingOption === "keep-current") {
      // Keep the existing address - use current site's billingAddressId
      if (site?.billingAddressId) {
        data.billingAddressId = site.billingAddressId
      }
      // If no addressId, the billing address string stays as-is
    } else if (billingOption === "new") {
      if (!data.newBillingAddress || !data.newBillingCity || !data.newBillingState || !data.newBillingZipCode || !data.newBillingCountry) {
        form.setError("newBillingAddress", { message: "All billing address fields are required when creating a new address" })
        return
      }
      data.billingAddressId = undefined
    } else if (billingOption === "default") {
      data.billingAddressId = defaultBillingAddressId
    }
    // else billingOption === "existing" - billingAddressId is already set from form

    // Handle shipping address based on selected option
    if (shippingOption === "keep-current") {
      // Keep the existing address - use current site's shippingAddressId
      if (site?.shippingAddressId) {
        data.shippingAddressId = site.shippingAddressId
      }
      // If no addressId, the shipping address string stays as-is
    } else if (shippingOption === "new") {
      if (!data.newShippingAddress || !data.newShippingCity || !data.newShippingState || !data.newShippingZipCode || !data.newShippingCountry) {
        form.setError("newShippingAddress", { message: "All shipping address fields are required when creating a new address" })
        return
      }
      data.shippingAddressId = undefined
    } else if (shippingOption === "default") {
      data.shippingAddressId = defaultShippingAddressId
    }
    // else shippingOption === "existing" - shippingAddressId is already set from form

    // Handle email addresses
    if (useDefaultBillingEmail) {
      data.billingEmail = defaultBillingEmail
    } else {
      if (!data.billingEmail) {
        form.setError("billingEmail", { message: "Billing email is required when not using default" })
        return
      }
    }

    if (useDefaultShippingEmail) {
      data.shippingEmail = defaultShippingEmail
    } else {
      if (!data.shippingEmail) {
        form.setError("shippingEmail", { message: "Shipping email is required when not using default" })
        return
      }
    }

    if (isEditMode && site && onUpdate) {
      onUpdate(site.id, data)
    } else {
      onCreate(data)
      // Reset form after creating new site
      form.reset()
      setBillingOption("default")
      setShippingOption("default")
      setUseDefaultBillingEmail(true)
      setUseDefaultShippingEmail(true)
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
              <h3 className="text-sm font-semibold">Billing & Shipping Configuration</h3>
              <Tabs defaultValue="billing" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="billing" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Billing
                  </TabsTrigger>
                  <TabsTrigger value="shipping" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Shipping
                  </TabsTrigger>
                </TabsList>

                {/* Billing Tab */}
                <TabsContent value="billing" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Billing Address
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Choose how to handle the billing address for this site
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                        className="space-y-2"
                      >
                        {/* Keep Current Address Option (only shown when editing) */}
                        {isEditMode && site?.billingAddress && (
                          <label 
                            htmlFor="billing-keep-current" 
                            className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                              billingOption === "keep-current" 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "hover:border-primary/50 hover:bg-accent/30"
                            }`}
                          >
                            <RadioGroupItem value="keep-current" id="billing-keep-current" className="mt-1" />
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium">Keep current address</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {site.billingAddress}
                              </p>
                            </div>
                          </label>
                        )}

                        <label 
                          htmlFor="billing-default" 
                          className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                            billingOption === "default" 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "hover:border-primary/50 hover:bg-accent/30"
                          }`}
                        >
                          <RadioGroupItem value="default" id="billing-default" className="mt-1" />
                          <div className="flex-1 space-y-2">
                            <div className="text-sm font-medium">Use default organization address</div>
                            {defaultBillingAddress && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {formatAddress(defaultBillingAddress)}
                              </p>
                            )}
                            {billingOption === "default" && defaultBillingAddress && (
                              <div className="flex items-start gap-2 mt-2 pt-2 border-t">
                                <Info className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                  Auto-updates when organization default changes
                                </p>
                              </div>
                            )}
                          </div>
                        </label>

                        <div className="space-y-2">
                          <label 
                            htmlFor="billing-existing" 
                            className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                              billingOption === "existing" 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "hover:border-primary/50 hover:bg-accent/30"
                            }`}
                          >
                            <RadioGroupItem value="existing" id="billing-existing" className="mt-1" />
                            <div className="flex-1 space-y-3">
                              <div className="text-sm font-medium">Select from existing addresses</div>
                              {billingOption === "existing" && (
                                <FormField
                                  control={form.control}
                                  name="billingAddressId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose an address" />
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
                              )}
                            </div>
                          </label>
                        </div>

                        <div className="space-y-2">
                          <label 
                            htmlFor="billing-new" 
                            className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                              billingOption === "new" 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "hover:border-primary/50 hover:bg-accent/30"
                            }`}
                          >
                            <RadioGroupItem value="new" id="billing-new" className="mt-1" />
                            <div className="flex-1 space-y-3">
                              <div className="text-sm font-medium">Create new address</div>
                              {billingOption === "new" && (
                                <div className="space-y-3 pt-2">
                                  <FormField
                                    control={form.control}
                                    name="newBillingAddress"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Street Address</FormLabel>
                                        <FormControl>
                                          <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                      control={form.control}
                                      name="newBillingCity"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">City</FormLabel>
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
                                          <FormLabel className="text-xs">State</FormLabel>
                                          <FormControl>
                                            <Input placeholder="NY" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                      control={form.control}
                                      name="newBillingZipCode"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">Zip Code</FormLabel>
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
                                          <FormLabel className="text-xs">Country</FormLabel>
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
                            </div>
                          </label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Billing Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <label 
                        htmlFor="use-default-billing-email" 
                        className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          useDefaultBillingEmail 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "hover:border-primary/50 hover:bg-accent/30"
                        }`}
                      >
                        <Checkbox
                          id="use-default-billing-email"
                          checked={useDefaultBillingEmail}
                          onCheckedChange={(checked) => {
                            setUseDefaultBillingEmail(checked === true)
                            form.setValue("useDefaultBillingEmail", checked === true)
                            if (checked === true) {
                              form.setValue("billingEmail", "")
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-medium">Use organization&apos;s default email</div>
                          {useDefaultBillingEmail && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {defaultBillingEmail}
                            </p>
                          )}
                        </div>
                      </label>
                      {!useDefaultBillingEmail && (
                        <div className="pt-1">
                          <FormField
                            control={form.control}
                            name="billingEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Custom Billing Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="billing@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Shipping Address
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Choose how to handle the shipping address for this site
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                        className="space-y-2"
                      >
                        {/* Keep Current Address Option (only shown when editing) */}
                        {isEditMode && site?.shippingAddress && (
                          <label 
                            htmlFor="shipping-keep-current" 
                            className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                              shippingOption === "keep-current" 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "hover:border-primary/50 hover:bg-accent/30"
                            }`}
                          >
                            <RadioGroupItem value="keep-current" id="shipping-keep-current" className="mt-1" />
                            <div className="flex-1 space-y-1">
                              <div className="text-sm font-medium">Keep current address</div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {site.shippingAddress}
                              </p>
                            </div>
                          </label>
                        )}

                        <label 
                          htmlFor="shipping-default" 
                          className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                            shippingOption === "default" 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "hover:border-primary/50 hover:bg-accent/30"
                          }`}
                        >
                          <RadioGroupItem value="default" id="shipping-default" className="mt-1" />
                          <div className="flex-1 space-y-2">
                            <div className="text-sm font-medium">Use default organization address</div>
                            {defaultShippingAddress && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {formatAddress(defaultShippingAddress)}
                              </p>
                            )}
                            {shippingOption === "default" && defaultShippingAddress && (
                              <div className="flex items-start gap-2 mt-2 pt-2 border-t">
                                <Info className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                  Auto-updates when organization default changes
                                </p>
                              </div>
                            )}
                          </div>
                        </label>

                        <div className="space-y-2">
                          <label 
                            htmlFor="shipping-existing" 
                            className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                              shippingOption === "existing" 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "hover:border-primary/50 hover:bg-accent/30"
                            }`}
                          >
                            <RadioGroupItem value="existing" id="shipping-existing" className="mt-1" />
                            <div className="flex-1 space-y-3">
                              <div className="text-sm font-medium">Select from existing addresses</div>
                              {shippingOption === "existing" && (
                                <FormField
                                  control={form.control}
                                  name="shippingAddressId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Choose an address" />
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
                              )}
                            </div>
                          </label>
                        </div>

                        <div className="space-y-2">
                          <label 
                            htmlFor="shipping-new" 
                            className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                              shippingOption === "new" 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "hover:border-primary/50 hover:bg-accent/30"
                            }`}
                          >
                            <RadioGroupItem value="new" id="shipping-new" className="mt-1" />
                            <div className="flex-1 space-y-3">
                              <div className="text-sm font-medium">Create new address</div>
                              {shippingOption === "new" && (
                                <div className="space-y-3 pt-2">
                                  <FormField
                                    control={form.control}
                                    name="newShippingAddress"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-xs">Street Address</FormLabel>
                                        <FormControl>
                                          <Input placeholder="123 Main St" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                      control={form.control}
                                      name="newShippingCity"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">City</FormLabel>
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
                                          <FormLabel className="text-xs">State</FormLabel>
                                          <FormControl>
                                            <Input placeholder="NY" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <FormField
                                      control={form.control}
                                      name="newShippingZipCode"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">Zip Code</FormLabel>
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
                                          <FormLabel className="text-xs">Country</FormLabel>
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
                            </div>
                          </label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Shipping Email
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <label 
                        htmlFor="use-default-shipping-email" 
                        className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          useDefaultShippingEmail 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "hover:border-primary/50 hover:bg-accent/30"
                        }`}
                      >
                        <Checkbox
                          id="use-default-shipping-email"
                          checked={useDefaultShippingEmail}
                          onCheckedChange={(checked) => {
                            setUseDefaultShippingEmail(checked === true)
                            form.setValue("useDefaultShippingEmail", checked === true)
                            if (checked === true) {
                              form.setValue("shippingEmail", "")
                            }
                          }}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-medium">Use organization&apos;s default email</div>
                          {useDefaultShippingEmail && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {defaultShippingEmail}
                            </p>
                          )}
                        </div>
                      </label>
                      {!useDefaultShippingEmail && (
                        <div className="pt-1">
                          <FormField
                            control={form.control}
                            name="shippingEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Custom Shipping Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="shipping@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  // Reset to appropriate defaults based on mode
                  if (isEditMode) {
                    setBillingOption("keep-current")
                    setShippingOption("keep-current")
                  } else {
                    setBillingOption("default")
                    setShippingOption("default")
                  }
                  setUseDefaultBillingEmail(true)
                  setUseDefaultShippingEmail(true)
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
