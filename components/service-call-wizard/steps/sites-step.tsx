'use client'

import { MapPin, Check, CreditCard, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useData } from '@/context/data-context'
import { cn } from '@/lib/utils'
import type { ServiceCallSite } from '@/lib/types'

interface SitesStepProps {
  customerId: string
  selectedSites: ServiceCallSite[]
  onSitesChange: (sites: ServiceCallSite[]) => void
  onNext: () => void
  onBack: () => void
}

export function SitesStep({
  customerId,
  selectedSites,
  onSitesChange,
  onNext,
  onBack,
}: SitesStepProps) {
  const { getSitesForCustomer, sites: allSites, customers } = useData()

  const customerSites = getSitesForCustomer(customerId)
  const customer = customers.find((c) => c.id === customerId)

  const handleSiteToggle = (siteId: string, checked: boolean) => {
    if (checked) {
      // Add site to selection
      const isFirstSite = selectedSites.length === 0
      onSitesChange([
        ...selectedSites,
        { siteId, isMainBillingSite: isFirstSite }, // First site is auto-selected as main
      ])
    } else {
      // Remove site from selection
      const updatedSites = selectedSites.filter((s) => s.siteId !== siteId)

      // If we removed the main billing site and there are still sites, make the first one main
      const removedWasMain = selectedSites.find((s) => s.siteId === siteId)?.isMainBillingSite
      if (removedWasMain && updatedSites.length > 0) {
        updatedSites[0].isMainBillingSite = true
      }

      onSitesChange(updatedSites)
    }
  }

  const handleMainBillingChange = (siteId: string) => {
    onSitesChange(
      selectedSites.map((s) => ({
        ...s,
        isMainBillingSite: s.siteId === siteId,
      }))
    )
  }

  const isSiteSelected = (siteId: string) => selectedSites.some((s) => s.siteId === siteId)
  const isMainBillingSite = (siteId: string) =>
    selectedSites.find((s) => s.siteId === siteId)?.isMainBillingSite ?? false

  const hasMainBillingSite = selectedSites.some((s) => s.isMainBillingSite)
  const isValid = selectedSites.length > 0 && hasMainBillingSite

  // No sites for this customer
  if (customerSites.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <p className="mt-4 font-medium text-destructive">No sites available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {customer?.name} has no sites configured. Please go back and select a different
              customer or add sites to this customer first.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Select Sites</CardTitle>
              <CardDescription>
                Choose one or more sites for this service call. Mark one as the main billing site.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Showing {customerSites.length} site{customerSites.length !== 1 ? 's' : ''} for{' '}
              <span className="font-medium text-foreground">{customer?.name}</span>
            </p>
          </div>

          {/* Sites list */}
          <div className="space-y-3">
            {customerSites.map((site) => {
              const isSelected = isSiteSelected(site.id)
              const isMain = isMainBillingSite(site.id)

              return (
                <div
                  key={site.id}
                  className={cn(
                    'rounded-lg border-2 p-4 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <Checkbox
                      id={`site-${site.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSiteToggle(site.id, checked as boolean)}
                      className="mt-1"
                    />

                    {/* Site info */}
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`site-${site.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span className="font-medium">{site.name}</span>
                        {isMain && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Main Billing
                          </Badge>
                        )}
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">{site.address}</p>

                      {/* Main billing site radio - only show when selected */}
                      {isSelected && selectedSites.length > 1 && (
                        <div className="mt-3 pt-3 border-t">
                          <button
                            type="button"
                            onClick={() => handleMainBillingChange(site.id)}
                            className={cn(
                              'flex items-center gap-2 text-sm transition-colors',
                              isMain
                                ? 'text-green-600 font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            <div
                              className={cn(
                                'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                                isMain ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
                              )}
                            >
                              {isMain && <Check className="h-2.5 w-2.5 text-white" />}
                            </div>
                            Use as main billing site
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected sites summary */}
      {selectedSites.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {selectedSites.length} site{selectedSites.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {selectedSites.map((selection) => {
                const site = allSites.find((s) => s.id === selection.siteId)
                return (
                  <p key={selection.siteId} className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {site?.name}
                    {selection.isMainBillingSite && (
                      <Badge variant="secondary" className="text-xs">
                        Billing
                      </Badge>
                    )}
                  </p>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation message */}
      {selectedSites.length > 0 && !hasMainBillingSite && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Please select a main billing site
        </p>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg">
          Continue to Details
        </Button>
      </div>
    </div>
  )
}
