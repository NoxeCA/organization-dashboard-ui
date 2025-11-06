import type { Site } from "@/components/organization/sites-management"
import type { Member } from "@/components/organization/members-management"
import type { Rate } from "@/components/organization/rates-management"

export const mockSites: Site[] = [
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
    // Example: Site-specific rates override organization rates
    rates: [
      {
        id: "site-1-1",
        laborField: "Installateur CCQ",
        rate: 70.0, // Higher rate for this site
        currency: "CAD",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        unit: "per hour",
      },
      {
        id: "site-1-2",
        laborField: "Technicien",
        rate: 60.0, // Higher rate for this site
        currency: "CAD",
        startDate: "2024-01-01",
        endDate: null,
        unit: "per hour",
      },
      {
        id: "site-1-3",
        laborField: "Transportation",
        rate: 1.0, // Higher transportation rate
        currency: "CAD",
        startDate: "2024-01-01",
        endDate: null,
        unit: "per km",
      },
    ] as Rate[],
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
    // This site uses organization-level rates (no site-specific rates)
  },
]

export const mockMembers: Member[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    position: "CEO",
    role: "Owner",
    status: "active",
    siteIds: ["1", "2"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    position: "Operations Manager",
    role: "Manager",
    status: "active",
    siteIds: ["1"],
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    position: "Field Technician",
    role: "Operator",
    status: "pending",
    siteIds: [],
  },
]

