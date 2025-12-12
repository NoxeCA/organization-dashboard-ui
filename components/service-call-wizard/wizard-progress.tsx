'use client'

import { Building2, MapPin, FileText, CheckCircle2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WizardStep = 'customer' | 'sites' | 'details' | 'review'

interface WizardProgressProps {
  currentStep: WizardStep
  completedSteps: WizardStep[]
  onStepClick?: (step: WizardStep) => void
}

const steps: { id: WizardStep; label: string; icon: React.ElementType }[] = [
  { id: 'customer', label: 'Customer', icon: Building2 },
  { id: 'sites', label: 'Sites', icon: MapPin },
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
]

export function WizardProgress({ currentStep, completedSteps, onStepClick }: WizardProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = step.id === currentStep
          const isPast = index < currentIndex
          const isClickable = isCompleted || isPast

          const Icon = step.icon

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  isCurrent && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && !isCurrent && 'border-primary bg-primary text-primary-foreground',
                  !isCurrent && !isCompleted && 'border-muted-foreground/30 bg-background text-muted-foreground',
                  isClickable && !isCurrent && 'cursor-pointer hover:border-primary/70 hover:bg-primary/10'
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </button>

              {/* Step label */}
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary',
                    isCompleted && !isCurrent && 'text-foreground',
                    !isCurrent && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  Step {index + 1} of {steps.length}
                </p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-4 h-0.5 flex-1 bg-muted-foreground/20">
                  <div
                    className={cn(
                      'h-full bg-primary transition-all duration-300',
                      index < currentIndex ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile step label */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-primary">
          {steps[currentIndex].label}
        </p>
        <p className="text-xs text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </p>
      </div>
    </div>
  )
}
