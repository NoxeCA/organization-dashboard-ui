"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateSiteDialog } from "./create-site-dialog"
import { MapPin, Plus, Building2, MoreVertical, Pencil } from "lucide-react"
import type { Member } from "./members-management"
import type { Rate } from "./rates-management"
import type { Address } from "./addresses-management"

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
  billingEmail?: string
  shippingEmail?: string
  rates?: Rate[] // Site-specific rates that override organization rates
}

interface SitesManagementProps {
  sites: Site[]
  onSitesChange: (sites: Site[]) => void
  members: Member[]
  organizationRates: Rate[]
  billingAddresses: Address[]
  shippingAddresses: Address[]
  defaultBillingAddressId: string
  defaultShippingAddressId: string
  defaultBillingEmail: string
  defaultShippingEmail: string
}

export function SitesManagement({ 
  sites, 
  onSitesChange, 
  members, 
  organizationRates,
  billingAddresses,
  shippingAddresses,
  defaultBillingAddressId,
  defaultShippingAddressId,
  defaultBillingEmail,
  defaultShippingEmail,
}: SitesManagementProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)

  const handleCreateSite = (siteData: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    billingAddressId?: string
    shippingAddressId?: string
    billingEmail?: string
    shippingEmail?: string
  }) => {
    const newSite: Site = {
      id: Date.now().toString(),
      ...siteData,
    }
    onSitesChange([...sites, newSite])
    setIsCreateDialogOpen(false)
  }

  const handleUpdateSite = (id: string, siteData: {
    name: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    billingAddressId?: string
    shippingAddressId?: string
    billingEmail?: string
    shippingEmail?: string
  }) => {
    const updatedSites = sites.map((site) =>
      site.id === id
        ? { ...site, ...siteData }
        : site
    )
    onSitesChange(updatedSites)
    setIsEditDialogOpen(false)
    setEditingSite(null)
  }

  const handleEditClick = (e: React.MouseEvent, site: Site) => {
    e.stopPropagation()
    setEditingSite(site)
    setIsEditDialogOpen(true)
  }

  const handleSiteClick = (site: Site) => {
    router.push(`/sites/${site.id}`)
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
          billingAddresses={billingAddresses}
          shippingAddresses={shippingAddresses}
          defaultBillingAddressId={defaultBillingAddressId}
          defaultShippingAddressId={defaultShippingAddressId}
          defaultBillingEmail={defaultBillingEmail}
          defaultShippingEmail={defaultShippingEmail}
        >
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Site
          </Button>
        </CreateSiteDialog>
        <CreateSiteDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingSite(null)
            }
          }}
          onCreate={handleCreateSite}
          onUpdate={handleUpdateSite}
          site={editingSite}
          billingAddresses={billingAddresses}
          shippingAddresses={shippingAddresses}
          defaultBillingAddressId={defaultBillingAddressId}
          defaultShippingAddressId={defaultShippingAddressId}
          defaultBillingEmail={defaultBillingEmail}
          defaultShippingEmail={defaultShippingEmail}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sites</CardTitle>
          <CardDescription>
            A list of all sites in your organization. Click on a site to view details.
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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
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
                  <TableRow
                    key={site.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSiteClick(site)}
                  >
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleEditClick(e, site)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

