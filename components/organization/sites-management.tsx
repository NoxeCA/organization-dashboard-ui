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
import { CreateSiteDialog } from "./create-site-dialog"
import { MapPin, Plus, Building2 } from "lucide-react"

export interface Site {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  billingAddressId?: string
  shippingAddressId?: string
  billingAddress?: string
  shippingAddress?: string
}

interface SitesManagementProps {
  sites: Site[]
  onSitesChange: (sites: Site[]) => void
}

export function SitesManagement({ sites, onSitesChange }: SitesManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateSite = (siteData: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    billingAddressId?: string
    shippingAddressId?: string
  }) => {
    const newSite: Site = {
      id: Date.now().toString(),
      ...siteData,
    }
    onSitesChange([...sites, newSite])
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sites</h2>
          <p className="text-muted-foreground text-sm">
            Manage your organization sites and locations
          </p>
        </div>
        <CreateSiteDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreate={handleCreateSite}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Site
          </Button>
        </CreateSiteDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sites</CardTitle>
          <CardDescription>
            A list of all sites in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Billing Address</TableHead>
                <TableHead>Shipping Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No sites yet</p>
                      <p className="text-muted-foreground text-sm">
                        Create your first site to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{site.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{site.address}</div>
                        <div className="text-muted-foreground">
                          {site.city}, {site.state} {site.zipCode}
                        </div>
                        <div className="text-muted-foreground">{site.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs">
                        {site.billingAddress || "Not set"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs">
                        {site.shippingAddress || "Not set"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

