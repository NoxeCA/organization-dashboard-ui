"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Globe, Building2, Diamond, ChevronDown } from "lucide-react"

export interface CustomerInfo {
  name: string
  website?: string
  logo?: string
  description?: string
  fieldOfWork?: string
  membership?: string
}

interface CustomerHeaderProps {
  customer: CustomerInfo
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  const formatWebsite = (url: string) => {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`)
      return urlObj.hostname.replace(/^www\./, "")
    } catch {
      return url.replace(/^https?:\/\//, "").replace(/^www\./, "")
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo Section */}
          {customer.logo && (
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg border bg-background overflow-hidden shadow-sm">
                <Image
                  src={customer.logo}
                  alt={`${customer.name} logo`}
                  fill
                  className="object-contain p-3"
                  sizes="(max-width: 768px) 96px, 112px"
                />
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {customer.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {customer.fieldOfWork && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {customer.fieldOfWork}
                  </Badge>
                )}
                {customer.membership && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 dark:bg-[#1A1A1A] border border-border dark:border-[#2A2A2A]">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 blur-md opacity-40 dark:opacity-60">
                        <Diamond className="h-4 w-4 text-cyan-500 dark:text-cyan-400" fill="currentColor" />
                      </div>
                      <Diamond 
                        className="h-4 w-4 text-cyan-500 dark:text-cyan-400 relative z-10" 
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))',
                          fill: 'currentColor'
                        }}
                      />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-muted-foreground dark:text-gray-400 font-medium">
                        Membership
                      </span>
                      <span 
                        className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 capitalize"
                        style={{
                          textShadow: '0 0 4px rgba(34, 211, 238, 0.4)',
                        }}
                      >
                        {customer.membership}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md ml-1 flex-shrink-0"
                    >
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {customer.description && (
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {customer.description}
              </p>
            )}

            {customer.website && (
              <div className="flex items-center gap-2 pt-1">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href={
                    customer.website.startsWith("http")
                      ? customer.website
                      : `https://${customer.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {formatWebsite(customer.website)}
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

