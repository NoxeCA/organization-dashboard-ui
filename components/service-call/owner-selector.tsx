'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Crown, UserPlus, Check, X } from 'lucide-react'

interface OwnerSelectorProps {
  employees: Employee[]
  ownerId?: string
  onOwnerChange: (id: string | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function OwnerSelector({
  employees,
  ownerId,
  onOwnerChange,
  disabled = false,
  className,
  placeholder = 'Assign owner',
}: OwnerSelectorProps) {
  const [open, setOpen] = useState(false)

  const owner = ownerId ? employees.find((e) => e.id === ownerId) : undefined

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSelect = (employeeId: string) => {
    if (ownerId === employeeId) {
      onOwnerChange(undefined)
    } else {
      onOwnerChange(employeeId)
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOwnerChange(undefined)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-start gap-2 h-9 px-3',
            !owner && 'text-muted-foreground',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {owner ? (
            <>
              <div className="relative">
                <Avatar className="h-5 w-5 ring-2 ring-amber-400">
                  <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700">
                    {getInitials(owner.name)}
                  </AvatarFallback>
                </Avatar>
                <Crown className="absolute -top-1 -right-1 h-2.5 w-2.5 text-amber-500 fill-amber-400" />
              </div>
              <span className="truncate font-medium">{owner.name}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleClear(e as unknown as React.MouseEvent)
                  }
                }}
                className="ml-auto h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </span>
            </>
          ) : (
            <>
              <Crown className="h-4 w-4 text-muted-foreground" />
              <span>{placeholder}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search employees..." className="h-9" />
          <CommandList>
            <CommandEmpty>No employees found.</CommandEmpty>
            <CommandGroup>
              {employees.map((employee) => {
                const isOwner = ownerId === employee.id
                return (
                  <CommandItem
                    key={employee.id}
                    value={employee.name}
                    onSelect={() => handleSelect(employee.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Avatar
                        className={cn(
                          'h-7 w-7',
                          isOwner && 'ring-2 ring-amber-400'
                        )}
                      >
                        <AvatarFallback
                          className={cn(
                            'text-[10px]',
                            isOwner
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {employee.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {employee.role}
                        </span>
                      </div>
                      {isOwner && (
                        <Check className="h-4 w-4 text-amber-600 flex-shrink-0" />
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
  )
}
