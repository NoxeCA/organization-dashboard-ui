import { ServiceCallForm } from './service-call-form'

export const metadata = {
  title: 'Submit Service Request',
  description: 'Submit a service request for quotes, equipment issues, installations, maintenance, or support.',
}

export default function FormPage() {
  return (
    <div className="container max-w-4xl py-8">
      <ServiceCallForm />
    </div>
  )
}
