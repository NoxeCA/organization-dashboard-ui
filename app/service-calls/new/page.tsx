'use client'

import { PageHeader } from '@/components/layout/page-header'
import { ServiceCallWizard } from '@/components/service-call-wizard'

export default function NewServiceCallPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Service Calls', href: '/service-calls' },
          { label: 'New Service Call' },
        ]}
      />

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <ServiceCallWizard />
        </div>
      </div>
    </div>
  )
}
