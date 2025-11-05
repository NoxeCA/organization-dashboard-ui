"use client"

import { RatesDisplay } from "./rates-display"

export interface Rate {
  id: string
  laborField: string
  rate: number
  currency: string
  startDate: string // ISO date string
  endDate: string | null // ISO date string or null for ongoing rates
  unit?: string // e.g., "per hour", "per day"
}

export const mockRates: Rate[] = [
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
  {
    id: "5",
    laborField: "Transportation",
    rate: 0.85,
    currency: "CAD",
    startDate: "2024-01-01",
    endDate: null, // Ongoing
    unit: "per km",
  },
]

export function RatesManagement() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Labor Rates</h2>
        <p className="text-muted-foreground text-sm">
          View labor field rates and their effective periods
        </p>
      </div>

      <RatesDisplay rates={mockRates} />
    </div>
  )
}

