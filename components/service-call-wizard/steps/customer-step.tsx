'use client'

import { useState } from 'react'
import { Building2, Search, Mail, Phone, MapPin, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/data-context'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/types'

interface CustomerStepProps {
  selectedCustomerId: string
  onCustomerSelect: (customerId: string) => void
  onNext: () => void
}

export function CustomerStep({ selectedCustomerId, onCustomerSelect, onNext }: CustomerStepProps) {
  const { customers, getSitesForCustomer } = useData()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query)
    )
  })

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const handleCustomerClick = (customer: Customer) => {
    onCustomerSelect(customer.id)
  }

  const isValid = !!selectedCustomerId

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Select Customer</CardTitle>
              <CardDescription>
                Choose the customer for this service call
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customer list */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="py-8 text-center">
                <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const siteCount = getSitesForCustomer(customer.id).length
                const isSelected = customer.id === selectedCustomerId

                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleCustomerClick(customer)}
                    className={cn(
                      'w-full flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/30'
                    )}
                  >
                    <div
                      className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      {isSelected ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{customer.name}</p>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          <MapPin className="h-3 w-3 mr-1" />
                          {siteCount} site{siteCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" />
                          {customer.email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected customer preview */}
      {selectedCustomer && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getSitesForCustomer(selectedCustomer.id).length} site(s) available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid} size="lg">
          Continue to Sites
        </Button>
      </div>
    </div>
  )
}
