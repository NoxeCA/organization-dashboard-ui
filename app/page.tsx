"use client"

import { useState, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersManagement } from "@/components/organization/members-management"
import { SitesManagement } from "@/components/organization/sites-management"
import { AddressesManagement } from "@/components/organization/addresses-management"
import { RatesManagement, mockRates } from "@/components/organization/rates-management"
import { RolesManagement } from "@/components/organization/roles-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerHeader, type CustomerInfo } from "@/components/organization/customer-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { mockSites, mockMembers } from "@/lib/mock-data"
import type { Site } from "@/components/organization/sites-management"
import type { Address } from "@/components/organization/addresses-management"

// Available roles - In a real app, this would come from your API/database
const availableRoles = ["Owner", "Manager", "Viewer", "Operator"]

// Mock customer data - In a real app, this would come from your API/database
const customerData: CustomerInfo = {
  name: "Acme Corporation",
  website: "https://www.acmecorp.com",
  logo: "/next.svg", // Using Next.js logo as placeholder - replace with actual logo URL
  description:
    "Acme Corporation is a leading provider of innovative solutions in the technology sector. We specialize in delivering cutting-edge products and services that help businesses transform their operations and achieve their goals.",
  fieldOfWork: "Technology & Software Development",
  membership: "premium tier 2",
}

// Mock addresses - In a real app, this would come from your API/database
const mockBillingAddresses: Address[] = [
  {
    id: "1",
    type: "billing",
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
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    siteId: "2",
    siteName: "Warehouse West",
  },
]

const mockShippingAddresses: Address[] = [
  {
    id: "1",
    type: "shipping",
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
    address: "456 Industrial Blvd",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "USA",
    siteId: "2",
    siteName: "Warehouse West",
  },
]

export default function Home() {
  const [sites, setSites] = useState<Site[]>(mockSites)
  const [billingAddresses, setBillingAddresses] = useState<Address[]>(mockBillingAddresses)
  const [shippingAddresses, setShippingAddresses] = useState<Address[]>(mockShippingAddresses)
  
  // Organization-level default addresses
  const [defaultBillingAddressId, setDefaultBillingAddressId] = useState<string>("1")
  const [defaultShippingAddressId, setDefaultShippingAddressId] = useState<string>("1")

  // Calculate member counts per role
  const memberCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockMembers.forEach((member) => {
      counts[member.role] = (counts[member.role] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <CustomerHeader customer={customerData} />
          </div>
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Organization Management</CardTitle>
            <CardDescription>
              Manage your organization members, sites, and addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="members" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="sites">Sites</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="rates">Rates</TabsTrigger>
              </TabsList>
              <TabsContent value="members" className="mt-6">
                <MembersManagement sites={sites} availableRoles={availableRoles} />
              </TabsContent>
              <TabsContent value="roles" className="mt-6">
                <RolesManagement memberCounts={memberCounts} />
              </TabsContent>
              <TabsContent value="sites" className="mt-6">
                <SitesManagement 
                  sites={sites} 
                  onSitesChange={setSites}
                  members={mockMembers}
                  organizationRates={mockRates}
                  billingAddresses={billingAddresses}
                  shippingAddresses={shippingAddresses}
                  defaultBillingAddressId={defaultBillingAddressId}
                  defaultShippingAddressId={defaultShippingAddressId}
                />
              </TabsContent>
              <TabsContent value="addresses" className="mt-6">
                <AddressesManagement 
                  billingAddresses={billingAddresses}
                  shippingAddresses={shippingAddresses}
                  onBillingAddressesChange={setBillingAddresses}
                  onShippingAddressesChange={setShippingAddresses}
                  defaultBillingAddressId={defaultBillingAddressId}
                  defaultShippingAddressId={defaultShippingAddressId}
                  onDefaultBillingAddressChange={setDefaultBillingAddressId}
                  onDefaultShippingAddressChange={setDefaultShippingAddressId}
                />
              </TabsContent>
              <TabsContent value="rates" className="mt-6">
                <RatesManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
