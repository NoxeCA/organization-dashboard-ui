"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2 } from "lucide-react"
import type { Site } from "./sites-management"
import type { Member } from "./members-management"

interface ManageMemberSitesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: Member | null
  sites: Site[]
  onSave: (memberId: string, siteIds: string[]) => void
}

export function ManageMemberSitesDialog({
  open,
  onOpenChange,
  member,
  sites,
  onSave,
}: ManageMemberSitesDialogProps) {
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([])

  useEffect(() => {
    if (member && open) {
      setSelectedSiteIds(member.siteIds || [])
    }
  }, [member, open])

  const handleToggleSite = (siteId: string) => {
    setSelectedSiteIds((prev) =>
      prev.includes(siteId)
        ? prev.filter((id) => id !== siteId)
        : [...prev, siteId]
    )
  }

  const handleSave = () => {
    if (member) {
      onSave(member.id, selectedSiteIds)
      onOpenChange(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Site Assignments</DialogTitle>
          <DialogDescription>
            Assign {member.name} to one or more sites. Members can be assigned
            to 0 or more sites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No sites available. Create a site first.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {sites.map((site) => {
                  const isSelected = selectedSiteIds.includes(site.id)
                  return (
                    <div
                      key={site.id}
                      className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`site-${site.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSite(site.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`site-${site.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {site.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {site.address}, {site.city}, {site.state} {site.zipCode}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="ml-auto">
                          Assigned
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          <div className="flex items-center justify-between text-sm border-t pt-4">
            <span className="text-muted-foreground">
              {selectedSiteIds.length} of {sites.length} sites selected
            </span>
            {selectedSiteIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSiteIds([])}
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Assignments</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

