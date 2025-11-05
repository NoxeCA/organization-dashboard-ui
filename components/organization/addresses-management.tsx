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
  label: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  siteId?: string
  siteName?: string
}

const mockBillingAddresses: Address[] = [
  {
    id: "1",
    type: "billing",
    label: "Main Office Billing",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    siteId: "1",
    siteName: "Main Office",
  },
  {
    id: "2",
    type: "billing",
    label: "Corporate Billing",
    address: "456 Corporate Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    country: "USA",
  },
]

const mockShippingAddresses: Address[] = [
  {
    id: "1",
    type: "shipping",
    label: "Main Office Shipping",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    siteId: "1",
    siteName: "Main Office",
  },
  {
    id: "2",
    type: "shipping",
    label: "Warehouse Shipping",
    address: "456 Industrial Blvd",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "USA",
    siteId: "2",
    siteName: "Warehouse West",
  },
]

export function AddressesManagement() {
  const [billingAddresses, setBillingAddresses] =
    useState<Address[]>(mockBillingAddresses)
  const [shippingAddresses, setShippingAddresses] =
    useState<Address[]>(mockShippingAddresses)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [addressType, setAddressType] = useState<"billing" | "shipping">("billing")

  const handleCreateAddress = (addressData: {
    type: "billing" | "shipping"
    label: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    siteId?: string
  }) => {
    const newAddress: Address = {
      id: Date.now().toString(),
      ...addressData,
    }

    if (addressData.type === "billing") {
      setBillingAddresses([...billingAddresses, newAddress])
    } else {
      setShippingAddresses([...shippingAddresses, newAddress])
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
                    <TableHead>Label</TableHead>
                    <TableHead>Address</TableHead>
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
                            <span className="font-medium">{address.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{address.address}</div>
                            <div className="text-muted-foreground">
                              {address.city}, {address.state} {address.zipCode}
                            </div>
                            <div className="text-muted-foreground">
                              {address.country}
                            </div>
                          </div>
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
                    <TableHead>Label</TableHead>
                    <TableHead>Address</TableHead>
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
                            <span className="font-medium">{address.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{address.address}</div>
                            <div className="text-muted-foreground">
                              {address.city}, {address.state} {address.zipCode}
                            </div>
                            <div className="text-muted-foreground">
                              {address.country}
                            </div>
                          </div>
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

