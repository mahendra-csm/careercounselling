import type { AssessmentAnswers } from '@/types/assessment';
import type { Report } from '@/types/report';
import { buildLocalDemoReport, isLocalMode } from '@/lib/local-db';
import {
  generateExecutiveSummary,
  generateSkillAnalysis,
  generateMarketAnalysis,
  generateRoadmap,
  generateInterviewQuestions,
} from '@/lib/anthropic';

export interface ProgressEvent {
  step: string;
  progress: number;
  message: string;
  reportId?: string;
  error?: string;
}

export async function generateFullReport(
  answers: AssessmentAnswers,
  userId: string,
  assessmentId: string,
  onProgress?: (event: ProgressEvent) => void
): Promise<Report> {
  if (isLocalMode()) {
    onProgress?.({ step: 'profile', progress: 10, message: 'Preparing your student report...' });
    onProgress?.({ step: 'complete', progress: 100, message: 'Report ready!' });
    return buildLocalDemoReport(answers, userId, assessmentId);
  }

  onProgress?.({ step: 'profile', progress: 10, message: 'Reviewing your answers...' });

  const [summaryResult, skillsResult] = await Promise.allSettled([
    generateExecutiveSummary(answers),
    generateSkillAnalysis(answers),
  ]);

  onProgress?.({ step: 'skills', progress: 40, message: 'Mapping strengths and improvement areas...' });

  const topGaps =
    skillsResult.status === 'fulfilled'
      ? skillsResult.value.skillGapAnalysis
          .filter((g) => g.importance === 'critical')
          .slice(0, 5)
          .map((g) => g.skill)
      : [];

  const [marketResult, roadmapResult, interviewResult] = await Promise.allSettled([
    generateMarketAnalysis(answers),
    generateRoadmap(answers, topGaps),
    generateInterviewQuestions(answers),
  ]);

  onProgress?.({ step: 'market', progress: 70, message: 'Comparing your path to career options...' });
  onProgress?.({ step: 'roadmap', progress: 85, message: 'Building your next-step plan...' });

  const summary =
    summaryResult.status === 'fulfilled'
      ? summaryResult.value
      : {
          overallScore: 60,
          matchLabel: 'Emerging Talent',
          executiveSummary: `${answers.name} is making a compelling transition from ${answers.currentRole} to ${answers.targetRole}. Your foundation of ${answers.currentSkills.slice(0, 3).join(', ')} positions you well for this move.\n\nWith ${answers.yearsExperience} years in ${answers.industry}, you bring valuable real-world context that many candidates lack. The key now is bridging the specific technical and leadership gaps that top ${answers.targetRole} candidates typically have.\n\nYour ${answers.topPriority}-focused approach and ${answers.timeline} timeline are realistic. The path forward is clear — focus on the critical skill gaps identified below and execute the 90-day roadmap.`,
          personalityInsights: {
            workStyle: `You operate at a ${answers.workPace} pace and thrive in ${answers.teamSize} team environments.`,
            strengthsNarrative: `Your background in ${answers.currentSkills.slice(0, 3).join(', ')} gives you a strong technical foundation.`,
            blindSpots: `As a career transitioner, you may underestimate the domain-specific knowledge required for ${answers.targetRole}.`,
            teamFitNote: `You do best in ${answers.managementStyle} environments where you can leverage your existing expertise.`,
          },
        };

  const skills =
    skillsResult.status === 'fulfilled'
      ? skillsResult.value
      : { skillScores: [], skillGapAnalysis: [] };

  const market =
    marketResult.status === 'fulfilled'
      ? marketResult.value
      : {
          opportunityScore: {
            overall: 65,
            marketDemand: 72,
            skillFit: 58,
            growthPotential: 80,
            marketInsight: `The ${answers.targetRole} market is competitive but accessible for candidates with the right skill combination.`,
            salaryBenchmark: {
              min: answers.salaryMin * 1000,
              max: answers.salaryMax * 1000,
              median: Math.round(((answers.salaryMin + answers.salaryMax) / 2) * 1000),
            },
          },
          jobMatches: [],
          competitiveAnalysis: {
            percentileRank: 55,
            topCompetitorSkills: [],
            uniqueAdvantages: [],
            differentiationStrategy: `Focus on highlighting your unique combination of ${answers.currentSkills.slice(0, 2).join(' and ')} to stand out.`,
          },
        };

  const roadmapData =
    roadmapResult.status === 'fulfilled'
      ? roadmapResult.value
      : { roadmap: [] };

  const interviewData =
    interviewResult.status === 'fulfilled'
      ? interviewResult.value
      : { interviewQuestions: [] };

  onProgress?.({ step: 'complete', progress: 100, message: 'Report ready!' });

  const report: Report = {
    id: assessmentId,
    userId,
    assessmentId,
    generatedAt: new Date().toISOString(),
    shareToken: '',
    overallScore: summary.overallScore,
    matchLabel: summary.matchLabel,
    executiveSummary: summary.executiveSummary,
    skillScores: skills.skillScores,
    opportunityScore: market.opportunityScore,
    skillGapAnalysis: skills.skillGapAnalysis,
    jobMatches: market.jobMatches,
    roadmap: roadmapData.roadmap,
    interviewQuestions: interviewData.interviewQuestions,
    personalityInsights: summary.personalityInsights,
    competitiveAnalysis: market.competitiveAnalysis,
    userName: answers.name,
    targetRole: answers.targetRole,
    currentRole: answers.currentRole,
    yearsExperience: answers.yearsExperience,
    industry: answers.industry,
    currentSkills: answers.currentSkills,
    companyType: answers.companyType,
    locationPreference: answers.locationPreference,
    salaryMin: answers.salaryMin,
    salaryMax: answers.salaryMax,
    timeline: answers.timeline,
    topPriority: answers.topPriority,
  };

  return report;
}
