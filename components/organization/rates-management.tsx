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
import { Calendar, DollarSign, Info, Briefcase } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export interface Rate {
  id: string
  laborField: string
  rate: number
  currency: string
  startDate: string // ISO date string
  endDate: string | null // ISO date string or null for ongoing rates
  unit?: string // e.g., "per hour", "per day"
}

const mockRates: Rate[] = [
  {
    id: "1",
    laborField: "Installateur CCQ",
    rate: 65.5,
    currency: "CAD",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    unit: "per hour",
  },
  {
    id: "2",
    laborField: "Technicien",
    rate: 55.0,
    currency: "CAD",
    startDate: "2024-01-01",
    endDate: null, // Ongoing
    unit: "per hour",
  },
  {
    id: "3",
    laborField: "Dev Senior",
    rate: 120.0,
    currency: "CAD",
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    unit: "per hour",
  },
  {
    id: "4",
    laborField: "Project Manager",
    rate: 95.0,
    currency: "CAD",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    unit: "per hour",
  },
]

export function RatesManagement() {
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

  const isCurrentRate = (rate: Rate) => {
    const today = new Date()
    const startDate = new Date(rate.startDate)
    const endDate = rate.endDate ? new Date(rate.endDate) : null

    return (
      startDate <= today && (endDate === null || endDate >= today)
    )
  }

  const isUpcomingRate = (rate: Rate) => {
    const today = new Date()
    const startDate = new Date(rate.startDate)
    return startDate > today
  }

  const isPastRate = (rate: Rate) => {
    const today = new Date()
    const endDate = rate.endDate ? new Date(rate.endDate) : null
    return endDate !== null && endDate < today
  }

  const getRateStatus = (rate: Rate) => {
    if (isCurrentRate(rate)) return "current"
    if (isUpcomingRate(rate)) return "upcoming"
    if (isPastRate(rate)) return "past"
    return "current"
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "current":
        return "default"
      case "upcoming":
        return "secondary"
      case "past":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Labor Rates</h2>
        <p className="text-muted-foreground text-sm">
          View labor field rates and their effective periods
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">
          Read-Only Information
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          These rates are set by employees in the Employee settings and cannot be
          modified from this interface. They reflect the rates in effect for your
          organization.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Rates by Labor Field</CardTitle>
          <CardDescription>
            Current and historical rates for different labor fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Labor Field</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Effective Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
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
                mockRates.map((rate) => {
                  const status = getRateStatus(rate)
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
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>
                              <span className="text-muted-foreground">From: </span>
                              {formatDate(rate.startDate)}
                            </span>
                            <span>
                              <span className="text-muted-foreground">To: </span>
                              {formatDate(rate.endDate)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(status)}>
                          {status === "current"
                            ? "Current"
                            : status === "upcoming"
                            ? "Upcoming"
                            : "Past"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

