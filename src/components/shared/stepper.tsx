import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: Array<{
    label: string;
    description?: string;
  }>;
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={index} className={cn('relative flex flex-1 flex-col items-center', index !== steps.length - 1 && 'pr-8')}>
              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute left-1/2 top-5 h-0.5 w-full',
                    isComplete ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}

              {/* Step circle */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isComplete && !isCurrent && 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isComplete ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <div className="mt-2 text-center">
                  <div className={cn('text-sm font-medium', isCurrent ? 'text-primary' : 'text-muted-foreground')}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
