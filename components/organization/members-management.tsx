"use client"

import { useState } from "react"
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
import { InviteMemberDialog } from "./invite-member-dialog"
import { ManageMemberSitesDialog } from "./manage-member-sites-dialog"
import { EditMemberRoleDialog } from "./edit-member-role-dialog"
import { UserPlus, Mail, User, Building2, Settings2, UserCog } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Site } from "./sites-management"

export interface Member {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "pending" | "inactive"
  avatar?: string
  siteIds?: string[]
}

const mockMembers: Member[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Owner",
    status: "active",
    siteIds: ["1", "2"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Manager",
    status: "active",
    siteIds: ["1"],
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Operator",
    status: "pending",
    siteIds: [],
  },
]

interface MembersManagementProps {
  sites: Site[]
  availableRoles: string[]
}

export function MembersManagement({ sites, availableRoles }: MembersManagementProps) {
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isManageSitesDialogOpen, setIsManageSitesDialogOpen] = useState(false)
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false)

  const handleInviteMember = (memberData: { email: string; role: string; siteIds?: string[] }) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name: memberData.email.split("@")[0],
      email: memberData.email,
      role: memberData.role,
      status: "pending",
      siteIds: memberData.siteIds || [],
    }
    setMembers([...members, newMember])
    setIsInviteDialogOpen(false)
  }

  const handleManageSites = (member: Member) => {
    setSelectedMember(member)
    setIsManageSitesDialogOpen(true)
  }

  const handleSaveSiteAssignments = (memberId: string, siteIds: string[]) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, siteIds } : member
      )
    )
  }

  const handleEditRole = (member: Member) => {
    setSelectedMember(member)
    setIsEditRoleDialogOpen(true)
  }

  const handleSaveRoleChange = (memberId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    )
  }

  const getSiteNames = (siteIds: string[] = []) => {
    return sites
      .filter((site) => siteIds.includes(site.id))
      .map((site) => site.name)
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Team Members</h2>
          <p className="text-muted-foreground text-sm">
            Manage who has access to your organization
          </p>
        </div>
        <InviteMemberDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
          onInvite={handleInviteMember}
          sites={sites}
          availableRoles={availableRoles}
        >
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </InviteMemberDialog>
      </div>

      <ManageMemberSitesDialog
        open={isManageSitesDialogOpen}
        onOpenChange={setIsManageSitesDialogOpen}
        member={selectedMember}
        sites={sites}
        onSave={handleSaveSiteAssignments}
      />

      <EditMemberRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        member={selectedMember}
        availableRoles={availableRoles}
        onSave={handleSaveRoleChange}
      />

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            A list of all members in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Sites</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No members yet</p>
                      <p className="text-muted-foreground text-sm">
                        Invite your first team member to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => {
                  const assignedSiteNames = getSiteNames(member.siteIds)
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
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
                        {assignedSiteNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedSiteNames.map((siteName) => (
                              <Badge
                                key={siteName}
                                variant="outline"
                                className="text-xs"
                              >
                                <Building2 className="mr-1 h-3 w-3" />
                                {siteName}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No sites assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditRole(member)}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleManageSites(member)}
                            >
                              <Building2 className="mr-2 h-4 w-4" />
                              Manage Sites
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

