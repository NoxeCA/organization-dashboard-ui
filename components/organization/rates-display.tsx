"use client"

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
import { Calendar, DollarSign, Briefcase, Link2, Edit } from "lucide-react"
import type { Rate } from "./rates-management"

interface RatesDisplayProps {
  rates: Rate[]
  title?: string
  description?: string
  source?: "inherited" | "custom"
}

export function RatesDisplay({ rates, title = "Rates by Labor Field", description = "Current and historical rates for different labor fields", source }: RatesDisplayProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ongoing"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate global effective period from all rates
  const getGlobalEffectivePeriod = () => {
    if (rates.length === 0) return null

    const startDates = rates.map((rate) => new Date(rate.startDate))
    const endDates = rates
      .map((rate) => (rate.endDate ? new Date(rate.endDate) : null))
      .filter((date): date is Date => date !== null)

    const earliestStart = new Date(Math.min(...startDates.map((d) => d.getTime())))
    const hasOngoingRates = rates.some((rate) => rate.endDate === null)
    const latestEnd = hasOngoingRates
      ? null
      : endDates.length > 0
      ? new Date(Math.max(...endDates.map((d) => d.getTime())))
      : null

    return {
      startDate: earliestStart.toISOString().split("T")[0],
      endDate: latestEnd ? latestEnd.toISOString().split("T")[0] : null,
    }
  }

  const globalPeriod = getGlobalEffectivePeriod()
  const isCustom = source === "custom"
  const isInherited = source === "inherited"

  return (
    <Card className={isCustom ? "border-primary/20" : isInherited ? "border-muted" : ""}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="m-0">{title || "Rates"}</CardTitle>
              {isCustom && (
                <Badge variant="default" className="gap-1.5">
                  <Edit className="h-3 w-3" />
                  Custom Rates
                </Badge>
              )}
              {isInherited && (
                <Badge variant="secondary" className="gap-1.5">
                  <Link2 className="h-3 w-3" />
                  Inherited
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1.5">
              {description}
            </CardDescription>
          </div>
          {globalPeriod && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 border border-border shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 shrink-0">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Effective Period
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="text-sm font-semibold">
                      {formatDate(globalPeriod.startDate)}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-muted-foreground">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">To</span>
                    <span className="text-sm font-semibold">
                      {formatDate(globalPeriod.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Labor Field</TableHead>
              <TableHead>Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No rates configured</p>
                    <p className="text-muted-foreground text-sm">
                      Rates will appear here once they are set by employees
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rates.map((rate) => {
                return (
                  <TableRow key={rate.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{rate.laborField}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {formatCurrency(rate.rate, rate.currency)}
                        </span>
                        {rate.unit && (
                          <span className="text-muted-foreground text-sm">
                            / {rate.unit}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

