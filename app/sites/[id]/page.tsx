"use client"

import { use } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Building2, Mail, User, ArrowLeft } from "lucide-react"
import { RatesDisplay } from "@/components/organization/rates-display"
import { mockRates } from "@/components/organization/rates-management"
import { mockSites, mockMembers } from "@/lib/mock-data"
import type { Member } from "@/components/organization/members-management"

interface SiteDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function SiteDetailsPage({ params }: SiteDetailsPageProps) {
  const { id } = use(params)
  const router = useRouter()

  const site = mockSites.find((s) => s.id === id)
  const assignedMembers = mockMembers.filter((member) =>
    member.siteIds?.includes(id)
  )

  if (!site) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Site Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The site you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadgeVariant = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "pending":
        return "secondary"
      case "inactive":
        return "outline"
      default:
        return "outline"
    }
  }

  // Use site-specific rates if available, otherwise fall back to organization rates
  const displayRates = site.rates && site.rates.length > 0 ? site.rates : mockRates
  const hasSiteSpecificRates = site.rates && site.rates.length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sites
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{site.name}</h1>
          </div>
          <p className="text-muted-foreground">
            Detailed information about this site
          </p>
        </div>

        <div className="space-y-6">
          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {site.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {site.city}, {site.state} {site.zipCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {site.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Billing Address</p>
                    <p className="text-sm text-muted-foreground">
                      {site.billingAddress || "Not set"}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Shipping Address</p>
                    <p className="text-sm text-muted-foreground">
                      {site.shippingAddress || "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Assigned Members ({assignedMembers.length})
              </CardTitle>
              <CardDescription>
                Team members assigned to this site
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedMembers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No members assigned</p>
                  <p className="text-muted-foreground text-sm">
                    Assign members to this site from the Members tab
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(member.status)}>
                            {member.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Rates */}
          <RatesDisplay
            rates={displayRates}
            title="Rates"
            description={
              hasSiteSpecificRates
                ? "Custom rates configured specifically for this site"
                : "Rates inherited from organization-level defaults"
            }
            source={hasSiteSpecificRates ? "custom" : "inherited"}
          />
        </div>
      </div>
    </div>
  )
}

