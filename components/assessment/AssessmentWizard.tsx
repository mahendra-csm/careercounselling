'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAssessmentStore } from '@/store/assessmentStore';
import StepIndicator from './StepIndicator';
import Step1Profile from './steps/Step1Profile';
import Step2Skills from './steps/Step2Skills';
import Step3TargetRole from './steps/Step3TargetRole';
import Step4WorkStyle from './steps/Step4WorkStyle';
import Step5Goals from './steps/Step5Goals';

const STEPS = [Step1Profile, Step2Skills, Step3TargetRole, Step4WorkStyle, Step5Goals];

const STEP_LABELS = [
  'About you',
  'Your skills',
  'Target role',
  'Work style',
  'Your goals',
];

export default function AssessmentWizard() {
  const { currentStep, setStep } = useAssessmentStore();

  const StepComponent = STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col flex-1">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={5}
          labels={STEP_LABELS}
        />

        <div className="flex-1 mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <StepComponent
                onNext={() => setStep(Math.min(currentStep + 1, 5))}
                onBack={currentStep > 1 ? () => setStep(currentStep - 1) : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
