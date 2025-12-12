'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Employee } from '@/lib/types'

interface AvatarGroupProps {
  employees: Employee[]
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function AvatarGroup({
  employees,
  max = 3,
  size = 'sm',
  className,
}: AvatarGroupProps) {
  const displayedEmployees = employees.slice(0, max)
  const remainingCount = employees.length - max

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
  }

  const overlapClasses = {
    sm: '-space-x-1.5',
    md: '-space-x-2',
  }

  if (employees.length === 0) {
    return null
  }

  return (
    <div className={cn('flex items-center', overlapClasses[size], className)}>
      {displayedEmployees.map((employee) => (
        <Avatar
          key={employee.id}
          className={cn(
            sizeClasses[size],
            'border-2 border-background ring-0'
          )}
          title={employee.name}
        >
          <AvatarFallback
            className={cn(
              sizeClasses[size],
              'bg-primary/10 text-primary font-medium'
            )}
          >
            {getInitials(employee.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <Avatar
          className={cn(
            sizeClasses[size],
            'border-2 border-background'
          )}
          title={`${remainingCount} more`}
        >
          <AvatarFallback
            className={cn(
              sizeClasses[size],
              'bg-muted text-muted-foreground font-medium'
            )}
          >
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
