import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssessmentAnswers } from '@/types/assessment';
import type { Report } from '@/types/report';

interface AssessmentState {
  currentStep: number;
  answers: Partial<AssessmentAnswers>;
  report: Report | null;
  reportId: string | null;
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisMessage: string;

  setStep: (step: number) => void;
  updateAnswers: (partial: Partial<AssessmentAnswers>) => void;
  setReport: (report: Report) => void;
  setReportId: (id: string) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setProgress: (progress: number, message: string) => void;
  reset: () => void;
}

const initialAnswers: Partial<AssessmentAnswers> = {
  name: '',
  currentRole: '',
  yearsExperience: 3,
  industry: '',
  currentSkills: [],
  targetRole: '',
  companyType: '',
  locationPreference: 'Remote',
  salaryMin: 80,
  salaryMax: 130,
  workPace: '',
  teamSize: '',
  managementStyle: '',
  learningStyle: '',
  timeline: '',
  topPriority: '',
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      currentStep: 1,
      answers: { ...initialAnswers },
      report: null,
      reportId: null,
      isAnalyzing: false,
      analysisProgress: 0,
      analysisMessage: '',

      setStep: (step) => set({ currentStep: step }),
      updateAnswers: (partial) =>
        set((state) => ({ answers: { ...state.answers, ...partial } })),
      setReport: (report) => set({ report }),
      setReportId: (reportId) => set({ reportId }),
      setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setProgress: (progress, message) =>
        set({ analysisProgress: progress, analysisMessage: message }),
      reset: () =>
        set({
          currentStep: 1,
          answers: { ...initialAnswers },
          report: null,
          reportId: null,
          isAnalyzing: false,
          analysisProgress: 0,
          analysisMessage: '',
        }),
    }),
    {
      name: 'onegrasp-assessment',
      partialize: (state) => ({
        answers: state.answers,
        currentStep: state.currentStep,
        reportId: state.reportId,
      }),
    }
  )
);
