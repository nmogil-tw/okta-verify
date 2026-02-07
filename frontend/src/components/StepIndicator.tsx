interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Enter Credentials' },
    { number: 2, label: 'Verify OTP' },
    { number: 3, label: 'Success' },
  ]

  return (
    <div className="flex items-center justify-between max-w-2xl">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                currentStep >= step.number
                  ? 'bg-okta-blue text-white shadow-[0_0_12px_rgba(0,125,193,0.3)]'
                  : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {currentStep > step.number ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span
              className={`mt-3 text-xs font-semibold transition-colors duration-300 ${
                currentStep >= step.number ? 'text-okta-blue' : 'text-neutral-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-3 rounded-full transition-all duration-500 ${
                currentStep > step.number ? 'bg-okta-blue' : 'bg-neutral-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}
