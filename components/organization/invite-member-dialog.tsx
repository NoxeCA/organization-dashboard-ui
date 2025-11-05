"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Building2 } from "lucide-react"
import { useState } from "react"
import type { Site } from "./sites-management"

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().min(1, "Please select a role"),
  siteIds: z.array(z.string()).optional(),
})

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>

interface InviteMemberDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onInvite: (data: InviteMemberFormValues & { siteIds?: string[] }) => void
  sites: Site[]
  availableRoles: string[]
  children?: React.ReactNode
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  onInvite,
  sites,
  availableRoles,
  children,
}: InviteMemberDialogProps) {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])

  const form = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: undefined,
      siteIds: [],
    },
  })

  const handleToggleSite = (siteId: string) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    )
  }

  const onSubmit = (data: InviteMemberFormValues) => {
    onInvite({ ...data, siteIds: selectedSiteIds })
    form.reset()
    setSelectedSiteIds([])
  }

  const handleClose = () => {
    form.reset()
    setSelectedSiteIds([])
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to a new team member. They will receive an email
            with instructions to join your organization. You can optionally assign them to sites.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="member@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The email address of the person you want to invite
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
                    Admins have full access, Members have limited access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-3">
              <div>
                <FormLabel>Assign to Sites (Optional)</FormLabel>
                <FormDescription className="mt-1">
                  Select sites to assign this member to. Members can be assigned to 0 or more sites.
                </FormDescription>
              </div>
              {sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 text-center border rounded-md">
                  <Building2 className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No sites available. Create a site first.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border p-3">
                  <div className="space-y-2">
                    {sites.map((site) => {
                      const isSelected = selectedSiteIds.includes(site.id)
                      return (
                        <div
                          key={site.id}
                          className="flex items-start space-x-2 rounded-md p-2 hover:bg-accent/50 transition-colors"
                        >
                          <Checkbox
                            id={`invite-site-${site.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleSite(site.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`invite-site-${site.id}`}
                              className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {site.name}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {site.address}, {site.city}, {site.state}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
              {selectedSiteIds.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {selectedSiteIds.length} site{selectedSiteIds.length !== 1 ? "s" : ""} selected
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSiteIds([])}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

