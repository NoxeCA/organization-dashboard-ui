"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Member } from "./members-management"

const editMemberSchema = z.object({
  position: z.string().optional(),
  role: z.string().min(1, "Please select a role"),
  status: z.enum(["active", "inactive"]),
})

type EditMemberFormValues = z.infer<typeof editMemberSchema>

interface EditMemberRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  availableRoles: string[]
  onSave: (memberId: string, updates: { role?: string; position?: string; status?: "active" | "inactive" }) => void
}

export function EditMemberRoleDialog({
  open,
  onOpenChange,
  member,
  availableRoles,
  onSave,
}: EditMemberRoleDialogProps) {
  const form = useForm<EditMemberFormValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      position: member?.position || "",
      role: member?.role || "",
      status: (member?.status === "pending" ? "active" : member?.status) || "active",
    },
  })

  // Update form when member changes
  React.useEffect(() => {
    if (member && open) {
      // If status is pending, default to active (pending cannot be manually set)
      const status = member.status === "pending" ? "active" : (member.status || "active")
      form.reset({ 
        position: member.position || "", 
        role: member.role,
        status: status
      })
    }
  }, [member, open, form])

  const onSubmit = (data: EditMemberFormValues) => {
    if (member) {
      onSave(member.id, { 
        position: data.position, 
        role: data.role,
        status: data.status
      })
      onOpenChange(false)
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

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update the position, role, and status for this team member.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 py-4 border-b">
          <Avatar>
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Financial Advisor"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The member's job title or position
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the role for this member. This determines their permissions and access level.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Active members have full access. Inactive members cannot access the system. Note: Pending status is automatically set for invited members who haven't registered yet and cannot be manually changed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

