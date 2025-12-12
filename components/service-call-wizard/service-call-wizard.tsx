'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import { useData } from '@/context/data-context'
import { WizardProgress, type WizardStep } from './wizard-progress'
import { CustomerStep } from './steps/customer-step'
import { SitesStep } from './steps/sites-step'
import { DetailsStep, type DetailsFormData } from './steps/details-step'
import { ReviewStep } from './steps/review-step'
import type { ServiceCallSite, ServiceCallFormData } from '@/lib/types'

const STEPS: WizardStep[] = ['customer', 'sites', 'details', 'review']

export function ServiceCallWizard() {
  const router = useRouter()
  const { addServiceCall } = useData()

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('customer')
  const [completedSteps, setCompletedSteps] = useState<WizardStep[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data state
  const [customerId, setCustomerId] = useState('')
  const [selectedSites, setSelectedSites] = useState<ServiceCallSite[]>([])
  const [detailsForm, setDetailsForm] = useState<DetailsFormData>({
    title: '',
    description: '',
    priority: 'medium',
    requesterName: '',
    requesterContact: '',
    issueType: 'other',
    equipmentType: '',
  })

  // Calculate progress
  const currentStepIndex = STEPS.indexOf(currentStep)
  const progress = Math.round(((currentStepIndex + 1) / STEPS.length) * 100)

  // Navigation handlers
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step)
  }, [])

  const handleNext = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex < STEPS.length - 1) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep])
      }
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }, [currentStep, completedSteps])

  const handleBack = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    }
  }, [currentStep])

  // Customer step handlers
  const handleCustomerSelect = useCallback((id: string) => {
    if (id !== customerId) {
      setCustomerId(id)
      // Clear sites when customer changes
      setSelectedSites([])
      // Remove sites from completed steps since they need to be re-selected
      setCompletedSteps((prev) => prev.filter((s) => s !== 'sites'))
    }
  }, [customerId])

  // Sites step handlers
  const handleSitesChange = useCallback((sites: ServiceCallSite[]) => {
    setSelectedSites(sites)
  }, [])

  // Details step handlers
  const handleDetailsChange = useCallback((data: Partial<DetailsFormData>) => {
    setDetailsForm((prev) => ({ ...prev, ...data }))
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const serviceCallData: ServiceCallFormData = {
        customerId,
        sites: selectedSites,
        title: detailsForm.title,
        description: detailsForm.description,
        priority: detailsForm.priority,
        requesterName: detailsForm.requesterName,
        requesterContact: detailsForm.requesterContact || undefined,
        issueType: detailsForm.issueType,
        equipmentType: detailsForm.equipmentType || undefined,
      }

      const newServiceCall = addServiceCall(serviceCallData)

      toast.success('Service call created successfully', {
        description: `Service call ${newServiceCall.id} has been created.`,
      })

      router.push(`/service-calls/${newServiceCall.id}`)
    } catch (error) {
      toast.error('Failed to create service call', {
        description: 'Please try again or contact support if the problem persists.',
      })
      console.error('Error creating service call:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [customerId, selectedSites, detailsForm, addServiceCall, router])

  // Edit handler (for review step)
  const handleEdit = useCallback((step: WizardStep) => {
    setCurrentStep(step)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-background via-background to-muted/50 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Create Service Call</h1>
                <p className="text-sm text-muted-foreground">
                  Follow the steps to create a new service request
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">{progress}%</p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-muted relative">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="4"
                  strokeDasharray={`${progress * 0.88} 88`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="p-4 rounded-lg border bg-card">
        <WizardProgress
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
      </div>

      {/* Step Content */}
      {currentStep === 'customer' && (
        <CustomerStep
          selectedCustomerId={customerId}
          onCustomerSelect={handleCustomerSelect}
          onNext={handleNext}
        />
      )}

      {currentStep === 'sites' && (
        <SitesStep
          customerId={customerId}
          selectedSites={selectedSites}
          onSitesChange={handleSitesChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 'details' && (
        <DetailsStep
          formData={detailsForm}
          onFormChange={handleDetailsChange}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {currentStep === 'review' && (
        <ReviewStep
          customerId={customerId}
          sites={selectedSites}
          title={detailsForm.title}
          description={detailsForm.description}
          priority={detailsForm.priority}
          requesterName={detailsForm.requesterName}
          requesterContact={detailsForm.requesterContact}
          issueType={detailsForm.issueType}
          equipmentType={detailsForm.equipmentType}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          onBack={handleBack}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
