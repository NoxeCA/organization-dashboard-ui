'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import type { Employee } from '@/lib/types'
import { cn } from '@/lib/utils'
import { UserPlus, Crown, Check } from 'lucide-react'

interface PeopleSelectorProps {
  employees: Employee[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  ownerId?: string
  onOwnerChange?: (id: string | undefined) => void
  disabled?: boolean
  className?: string
  showOwner?: boolean
}

export function PeopleSelector({
  employees,
  selectedIds,
  onChange,
  ownerId,
  onOwnerChange,
  disabled = false,
  className,
  showOwner = true,
}: PeopleSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedEmployees = employees.filter((e) => selectedIds.includes(e.id))
  const owner = ownerId ? employees.find((e) => e.id === ownerId) : undefined

  // Sort selected employees to put owner first
  const sortedSelectedEmployees = [...selectedEmployees].sort((a, b) => {
    if (a.id === ownerId) return -1
    if (b.id === ownerId) return 1
    return 0
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleEmployee = (employeeId: string) => {
    if (selectedIds.includes(employeeId)) {
      // When removing an employee, also clear owner if it's them
      if (ownerId === employeeId && onOwnerChange) {
        onOwnerChange(undefined)
      }
      onChange(selectedIds.filter((id) => id !== employeeId))
    } else {
      onChange([...selectedIds, employeeId])
    }
  }

  const handleSetOwner = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onOwnerChange) return

    // Toggle owner - if clicking current owner, remove them
    if (ownerId === employeeId) {
      onOwnerChange(undefined)
    } else {
      // If setting owner, make sure they're also assigned
      if (!selectedIds.includes(employeeId)) {
        onChange([...selectedIds, employeeId])
      }
      onOwnerChange(employeeId)
    }
  }

  const displayedEmployees = sortedSelectedEmployees.slice(0, 3)
  const remainingCount = sortedSelectedEmployees.length - 3

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            className={cn(
              'flex items-center justify-center min-w-[80px] h-7 rounded transition-colors hover:bg-muted/50',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {sortedSelectedEmployees.length > 0 ? (
              <div className="flex items-center -space-x-1.5">
                {displayedEmployees.map((employee, index) => (
                  <div key={employee.id} className="relative">
                    <Avatar
                      className={cn(
                        'h-6 w-6 border-2 border-background ring-0',
                        employee.id === ownerId && showOwner && 'ring-2 ring-amber-400 ring-offset-1 ring-offset-background'
                      )}
                      title={employee.name + (employee.id === ownerId ? ' (Owner)' : '')}
                    >
                      <AvatarFallback
                        className={cn(
                          'text-[10px] font-medium',
                          employee.id === ownerId && showOwner
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    {employee.id === ownerId && showOwner && index === 0 && (
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 fill-amber-400" />
                    )}
                  </div>
                ))}
                {remainingCount > 0 && (
                  <Avatar
                    className="h-6 w-6 border-2 border-background"
                    title={`${remainingCount} more`}
                  >
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground font-medium">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <UserPlus className="h-4 w-4" />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-0"
          align="center"
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="Search people..." className="h-9" />
            <CommandList>
              <CommandEmpty>No people found.</CommandEmpty>
              <CommandGroup>
                {employees.map((employee) => {
                  const isSelected = selectedIds.includes(employee.id)
                  const isOwner = ownerId === employee.id
                  return (
                    <CommandItem
                      key={employee.id}
                      onSelect={() => toggleEmployee(employee.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Checkbox
                          checked={isSelected}
                          className="h-4 w-4"
                        />
                        <Avatar className={cn(
                          'h-6 w-6',
                          isOwner && 'ring-2 ring-amber-400'
                        )}>
                          <AvatarFallback className={cn(
                            'text-[10px]',
                            isOwner
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-primary/10 text-primary'
                          )}>
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate flex items-center gap-1">
                            {employee.name}
                            {isOwner && (
                              <Crown className="h-3 w-3 text-amber-500 fill-amber-400 flex-shrink-0" />
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {employee.role}
                          </span>
                        </div>
                        {showOwner && onOwnerChange && isSelected && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => handleSetOwner(employee.id, e)}
                                className={cn(
                                  'flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors',
                                  isOwner
                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                )}
                              >
                                <Crown className={cn(
                                  'h-3.5 w-3.5',
                                  isOwner && 'fill-amber-400'
                                )} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              {isOwner ? 'Remove as owner' : 'Set as owner'}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
