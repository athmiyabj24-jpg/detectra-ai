'use client';

import { Check, Loader2, FileText, Brain, History, Search, Calculator, FileCheck } from 'lucide-react';
import type { InputType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STEPS = [
  { id: 1, label: 'Extracting Text', icon: FileText, description: 'Processing input data' },
  { id: 2, label: 'NLP Analysis', icon: Brain, description: 'Classifying claim with AI' },
  { id: 3, label: 'Historical Comparison', icon: History, description: 'Comparing with past claims' },
  { id: 4, label: 'Phrase Detection', icon: Search, description: 'Identifying suspicious patterns' },
  { id: 5, label: 'Risk Calculation', icon: Calculator, description: 'Computing risk scores' },
  { id: 6, label: 'Generating Report', icon: FileCheck, description: 'Compiling analysis results' },
];

interface ProcessingStepsProps {
  currentStep: number;
  inputType: InputType;
}

export function ProcessingSteps({ currentStep, inputType }: ProcessingStepsProps) {
  // Customize first step based on input type
  const steps = [...STEPS];
  if (inputType === 'image') {
    steps[0] = { ...steps[0], label: 'OCR Processing', description: 'Extracting text from image' };
  } else if (inputType === 'video') {
    steps[0] = { ...steps[0], label: 'Transcribing Video', description: 'Converting speech to text' };
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Analyzing Claim</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => {
            const status = currentStep > step.id ? 'complete' : currentStep === step.id ? 'processing' : 'pending';
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 rounded-lg p-4 transition-colors ${
                  status === 'complete'
                    ? 'bg-primary/10'
                    : status === 'processing'
                    ? 'bg-secondary'
                    : 'bg-secondary/30'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    status === 'complete'
                      ? 'bg-primary text-primary-foreground'
                      : status === 'processing'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {status === 'complete' ? (
                    <Check className="h-5 w-5" />
                  ) : status === 'processing' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {status === 'complete' && (
                  <span className="text-xs font-medium text-primary">Complete</span>
                )}
                {status === 'processing' && (
                  <span className="text-xs font-medium text-primary animate-pulse">Processing...</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            This may take a few seconds. Please do not close this window.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
