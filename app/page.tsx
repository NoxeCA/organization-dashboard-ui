"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersManagement } from "@/components/organization/members-management"
import { SitesManagement } from "@/components/organization/sites-management"
import { AddressesManagement } from "@/components/organization/addresses-management"
import { RatesManagement } from "@/components/organization/rates-management"
import { RolesManagement } from "@/components/organization/roles-management"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerHeader, type CustomerInfo } from "@/components/organization/customer-header"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Site } from "@/components/organization/sites-management"
import type { Member } from "@/components/organization/members-management"
import { useMemo } from "react"

// Available roles - In a real app, this would come from your API/database
const availableRoles = ["Owner", "Manager", "Viewer", "Operator"]

const initialSites: Site[] = [
  {
    id: "1",
    name: "Main Office",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA",
    billingAddress: "123 Main St, New York, NY 10001",
    shippingAddress: "123 Main St, New York, NY 10001",
  },
  {
    id: "2",
    name: "Warehouse West",
    address: "456 Industrial Blvd",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "USA",
    billingAddress: "123 Main St, New York, NY 10001",
    shippingAddress: "456 Industrial Blvd, Los Angeles, CA 90001",
  },
]

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

export default function Home() {
  const [sites, setSites] = useState<Site[]>(initialSites)
  
  // Mock members data - In a real app, this would come from your API/database
  const mockMembers: Member[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Owner",
      status: "active",
      siteIds: ["1", "2"],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Manager",
      status: "active",
      siteIds: ["1"],
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Operator",
      status: "pending",
      siteIds: [],
    },
  ]

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
                <SitesManagement sites={sites} onSitesChange={setSites} />
              </TabsContent>
              <TabsContent value="addresses" className="mt-6">
                <AddressesManagement />
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
