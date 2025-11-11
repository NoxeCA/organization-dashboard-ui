"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateAddressDialog } from "./create-address-dialog"
import { MapPin, Plus, Package, CreditCard } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface Address {
  id: string
  type: "billing" | "shipping"
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  email: string
  siteId?: string
  siteName?: string
}

interface AddressesManagementProps {
  billingAddresses: Address[]
  shippingAddresses: Address[]
  onBillingAddressesChange: (addresses: Address[]) => void
  onShippingAddressesChange: (addresses: Address[]) => void
  defaultBillingAddressId?: string
  defaultShippingAddressId?: string
  onDefaultBillingAddressChange?: (id: string) => void
  onDefaultShippingAddressChange?: (id: string) => void
  defaultBillingEmail?: string
  defaultShippingEmail?: string
}

export function AddressesManagement({
  billingAddresses,
  shippingAddresses,
  onBillingAddressesChange,
  onShippingAddressesChange,
  defaultBillingAddressId,
  defaultShippingAddressId,
  onDefaultBillingAddressChange,
  onDefaultShippingAddressChange,
  defaultBillingEmail,
  defaultShippingEmail,
}: AddressesManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [addressType, setAddressType] = useState<"billing" | "shipping">("billing")

  const handleCreateAddress = (addressData: {
    type: "billing" | "shipping"
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    email: string
    siteId?: string
  }) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      ...addressData,
    }

    if (addressData.type === "billing") {
      onBillingAddressesChange([...billingAddresses, newAddress])
    } else {
      onShippingAddressesChange([...shippingAddresses, newAddress])
    }
    setIsCreateDialogOpen(false)
  }

  const openCreateDialog = (type: "billing" | "shipping") => {
    setAddressType(type)
    setIsCreateDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Addresses</h2>
          <p className="text-muted-foreground text-sm">
            Manage billing and shipping addresses for your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => openCreateDialog("billing")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Add Billing Address
          </Button>
          <Button
            variant="outline"
            onClick={() => openCreateDialog("shipping")}
          >
            <Package className="mr-2 h-4 w-4" />
            Add Shipping Address
          </Button>
        </div>
      </div>

      <CreateAddressDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) setAddressType("billing")
        }}
        onCreate={handleCreateAddress}
        type={addressType}
        defaultBillingEmail={defaultBillingEmail}
        defaultShippingEmail={defaultShippingEmail}
      />

      <Tabs defaultValue="billing" className="w-full">
        <TabsList>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing Addresses
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Package className="mr-2 h-4 w-4" />
            Shipping Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Addresses</CardTitle>
              <CardDescription>
                Manage billing addresses for invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => openCreateDialog("billing")}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Billing Address
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Site</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingAddresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No billing addresses yet
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Create your first billing address
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    billingAddresses.map((address) => (
                      <TableRow key={address.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div>{address.address}</div>
                              <div className="text-muted-foreground">
                                {address.city}, {address.state} {address.zipCode}
                              </div>
                              <div className="text-muted-foreground">
                                {address.country}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{address.email}</div>
                        </TableCell>
                        <TableCell>
                          {address.siteName ? (
                            <Badge variant="secondary">{address.siteName}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not linked
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Addresses</CardTitle>
              <CardDescription>
                Manage shipping addresses for deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={() => openCreateDialog("shipping")}
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Shipping Address
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Site</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingAddresses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No shipping addresses yet
                          </p>
                          <p className="text-muted-foreground text-sm">
                            Create your first shipping address
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    shippingAddresses.map((address) => (
                      <TableRow key={address.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div>{address.address}</div>
                              <div className="text-muted-foreground">
                                {address.city}, {address.state} {address.zipCode}
                              </div>
                              <div className="text-muted-foreground">
                                {address.country}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{address.email}</div>
                        </TableCell>
                        <TableCell>
                          {address.siteName ? (
                            <Badge variant="secondary">{address.siteName}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not linked
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

