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
import { Shield, Users, UserCheck } from "lucide-react"

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  memberCount?: number
}

const mockRoles: Role[] = [
  {
    id: "Owner",
    name: "Owner",
    description:
      "Full access to all features. Can manage users, locations, and billing addresses.",
    permissions: [
      "Manage users",
      "Manage locations",
      "Manage billing addresses",
      "Manage shipping addresses",
      "Manage members",
      "Assign sites to members",
      "Modify roles",
      "View rates",
      "Manage organization settings",
    ],
  },
  {
    id: "Manager",
    name: "Manager",
    description:
      "Can view all locations, users, and data, but cannot make any modifications.",
    permissions: [
      "View all users",
      "View all locations",
      "View all addresses",
      "View members and their assignments",
      "View rates",
      "View projects",
      "View service calls",
      "Read-only access",
    ],
  },
  {
    id: "Viewer",
    name: "Viewer",
    description:
      "Read-only access to view organization data without being able to make modifications.",
    permissions: [
      "View projects",
      "View service calls",
      "View rates",
      "View members",
      "View locations",
    ],
  },
  {
    id: "Operator",
    name: "Operator",
    description:
      "Operational access to perform daily tasks and interact with assigned projects and service calls.",
    permissions: [
      "View assigned projects",
      "View assigned service calls",
      "Update task status",
      "Create work reports",
      "View rates",
      "View own profile",
    ],
  },
]

interface RolesManagementProps {
  memberCounts?: Record<string, number>
}

export function RolesManagement({ memberCounts = {} }: RolesManagementProps) {
  const rolesWithCounts = mockRoles.map((role) => ({
    ...role,
    memberCount: memberCounts[role.id] || 0,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Roles & Permissions</h2>
        <p className="text-muted-foreground text-sm">
          Define and manage roles for your organization members
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Roles</CardTitle>
          <CardDescription>
            Roles define what members can access and do within your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rolesWithCounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No roles defined</p>
                      <p className="text-muted-foreground text-sm">
                        Roles will appear here once they are configured
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rolesWithCounts.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-md">{role.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{role.memberCount}</span>
                        <span className="text-muted-foreground text-sm">
                          member{role.memberCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Permissions View */}
      <div className="grid gap-4 md:grid-cols-2">
        {rolesWithCounts.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {role.name}
              </CardTitle>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  Permissions
                </div>
                <ul className="space-y-1">
                  {role.permissions.map((permission, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-1">•</span>
                      <span>{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

