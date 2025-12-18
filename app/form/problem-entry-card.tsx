'use client'

import { Trash2, GripVertical, AlertTriangle, Wrench, HelpCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  type RequestType,
  type ProblemEntry,
  type EquipmentCategory,
  type ProblemType,
  type MaintenanceType,
  EQUIPMENT_CATEGORIES,
  PROBLEM_TYPES,
  MAINTENANCE_TYPES,
} from './form-config'

interface ProblemEntryCardProps {
  entry: ProblemEntry
  index: number
  requestType: RequestType
  canDelete: boolean
  onUpdate: (id: string, updates: Partial<ProblemEntry>) => void
  onDelete: (id: string) => void
}

export function ProblemEntryCard({
  entry,
  index,
  requestType,
  canDelete,
  onUpdate,
  onDelete,
}: ProblemEntryCardProps) {
  const isEquipmentIssue = requestType === 'equipment_issue'
  const isMaintenance = requestType === 'maintenance'
  const isSupport = requestType === 'support'

  const getIcon = () => {
    if (isEquipmentIssue) return AlertTriangle
    if (isMaintenance) return Wrench
    return HelpCircle
  }

  const getTitle = () => {
    if (isEquipmentIssue) return 'Problem'
    if (isMaintenance) return 'Equipment'
    return 'Issue'
  }

  const Icon = getIcon()
  const title = getTitle()

  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GripVertical className="h-4 w-4 cursor-grab" />
            </div>
            <div className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center',
              isEquipmentIssue && 'bg-red-100 dark:bg-red-900/30',
              isMaintenance && 'bg-blue-100 dark:bg-blue-900/30',
              isSupport && 'bg-purple-100 dark:bg-purple-900/30',
            )}>
              <Icon className={cn(
                'h-4 w-4',
                isEquipmentIssue && 'text-red-600 dark:text-red-400',
                isMaintenance && 'text-blue-600 dark:text-blue-400',
                isSupport && 'text-purple-600 dark:text-purple-400',
              )} />
            </div>
            <div>
              <span className="font-medium">{title} #{index + 1}</span>
              {entry.equipmentCategory && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {EQUIPMENT_CATEGORIES.find(c => c.value === entry.equipmentCategory)?.label}
                </Badge>
              )}
            </div>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment Selection - Common to all */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Equipment Category
              <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
            </Label>
            <Select
              value={entry.equipmentCategory || ''}
              onValueChange={(value) => onUpdate(entry.id, { equipmentCategory: value as EquipmentCategory })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select equipment type" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model / Serial Number</Label>
            <Input
              placeholder="e.g., Model XYZ-1234"
              value={entry.equipmentModel || ''}
              onChange={(e) => onUpdate(entry.id, { equipmentModel: e.target.value })}
            />
          </div>
        </div>

        {/* Equipment Issue specific fields */}
        {isEquipmentIssue && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Type of Problem
                  <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                </Label>
                <Select
                  value={entry.problemType || ''}
                  onValueChange={(value) => onUpdate(entry.id, { problemType: value as ProblemType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select problem type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROBLEM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>When did the problem start?</Label>
                <Input
                  placeholder="e.g., Yesterday, Last week"
                  value={entry.whenStarted || ''}
                  onChange={(e) => onUpdate(entry.id, { whenStarted: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Problem Description
                <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
              </Label>
              <Textarea
                placeholder="Describe the problem in detail. What symptoms are you experiencing?"
                value={entry.problemDescription || ''}
                onChange={(e) => onUpdate(entry.id, { problemDescription: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`accessible-${entry.id}`}
                checked={entry.isEquipmentAccessible ?? true}
                onCheckedChange={(checked) => onUpdate(entry.id, { isEquipmentAccessible: checked as boolean })}
              />
              <Label htmlFor={`accessible-${entry.id}`} className="font-normal cursor-pointer">
                The equipment is easily accessible for a technician
              </Label>
            </div>
          </>
        )}

        {/* Maintenance specific fields */}
        {isMaintenance && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Maintenance Type
                  <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
                </Label>
                <Select
                  value={entry.maintenanceType || ''}
                  onValueChange={(value) => onUpdate(entry.id, { maintenanceType: value as MaintenanceType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maintenance type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MAINTENANCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Last Service Date</Label>
                <Input
                  type="date"
                  value={entry.lastServiceDate || ''}
                  onChange={(e) => onUpdate(entry.id, { lastServiceDate: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* Support specific fields */}
        {isSupport && (
          <>
            <div className="space-y-2">
              <Label>
                Issue Description
                <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
              </Label>
              <Textarea
                placeholder="Describe your technical issue in detail..."
                value={entry.problemDescription || ''}
                onChange={(e) => onUpdate(entry.id, { problemDescription: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Error Messages (if any)</Label>
              <Textarea
                placeholder="Copy and paste any error messages or codes you're seeing..."
                value={entry.errorMessages || ''}
                onChange={(e) => onUpdate(entry.id, { errorMessages: e.target.value })}
                className="min-h-[60px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Steps Already Tried</Label>
              <Textarea
                placeholder="What troubleshooting steps have you already tried?"
                value={entry.stepsTriedDescription || ''}
                onChange={(e) => onUpdate(entry.id, { stepsTriedDescription: e.target.value })}
                className="min-h-[60px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`remote-${entry.id}`}
                checked={entry.remoteAccessAvailable ?? false}
                onCheckedChange={(checked) => onUpdate(entry.id, { remoteAccessAvailable: checked as boolean })}
              />
              <Label htmlFor={`remote-${entry.id}`} className="font-normal cursor-pointer">
                Remote access is available for troubleshooting
              </Label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
