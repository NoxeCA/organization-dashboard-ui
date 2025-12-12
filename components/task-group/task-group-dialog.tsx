'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from './color-picker'
import { DEFAULT_GROUP_COLOR } from '@/lib/constants'
import type { TaskGroup, TaskGroupFormData } from '@/lib/types'
import { Calendar } from 'lucide-react'

interface TaskGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: TaskGroup
  onSubmit: (data: TaskGroupFormData) => void
}

export function TaskGroupDialog({
  open,
  onOpenChange,
  group,
  onSubmit,
}: TaskGroupDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(DEFAULT_GROUP_COLOR)
  const [dueDate, setDueDate] = useState('')

  const isEditing = !!group

  useEffect(() => {
    if (group) {
      setName(group.name)
      setColor(group.color)
      setDueDate(group.dueDate || '')
    } else {
      setName('')
      setColor(DEFAULT_GROUP_COLOR)
      setDueDate('')
    }
  }, [group, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      color,
      dueDate: dueDate || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Group' : 'Create Group'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the group details below.'
                : 'Create a new group to organize your tasks.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Phase 1: Assessment"
                autoFocus
              />
            </div>

            {/* Color */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <ColorPicker value={color} onChange={setColor} />
                <span className="text-sm text-muted-foreground">
                  Choose a color to identify this group
                </span>
              </div>
            </div>

            {/* Due Date */}
            <div className="grid gap-2">
              <Label htmlFor="dueDate">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date (Optional)
                </span>
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEditing ? 'Save Changes' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
