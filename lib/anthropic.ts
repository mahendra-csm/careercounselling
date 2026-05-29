import Anthropic from '@anthropic-ai/sdk';
import type { AssessmentAnswers } from '@/types/assessment';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(systemPrompt: string, userPrompt: string, retries = 1): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      const content = message.content[0];
      if (content.type !== 'text') throw new Error('Unexpected response type');
      return content.text;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error('All retries exhausted');
}

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as T;
}

const SYSTEM_PROMPT = `You are a senior career coach and talent analyst with 20 years experience placing professionals at top companies. Analyze the user's career profile and generate a candid, personalized assessment. Be specific, not generic. Reference their actual skills and target role explicitly. Always return valid JSON only, no markdown fences, no commentary.`;

export async function generateExecutiveSummary(a: AssessmentAnswers) {
  const prompt = `Analyze this professional profile and return a JSON object:

Profile:
- Name: ${a.name}
- Current Role: ${a.currentRole} (${a.yearsExperience} years experience)
- Industry: ${a.industry}
- Current Skills: ${a.currentSkills.join(', ')}
- Target Role: ${a.targetRole} at a ${a.companyType} company
- Location: ${a.locationPreference}
- Work Style: ${a.workPace} pace, ${a.teamSize} team, ${a.managementStyle} management
- Learning Style: ${a.learningStyle}
- Salary Goal: $${a.salaryMin}k – $${a.salaryMax}k
- Timeline: ${a.timeline}
- Top Priority: ${a.topPriority}

Return ONLY valid JSON (no markdown, no explanation):
{
  "overallScore": <number 0-100, be realistic based on gap between currentRole/skills and targetRole>,
  "matchLabel": <"Top Candidate"|"Strong Candidate"|"Emerging Talent"|"Career Switcher"|"High Potential">,
  "executiveSummary": <3 paragraphs separated by \\n\\n, personal, specific, name them by name, reference their exact skills and target role, mention what makes them stand out AND what they need to fix, warm but honest tone>,
  "personalityInsights": {
    "workStyle": <2 sentences about their work style based on answers>,
    "strengthsNarrative": <specific strengths based on their skill list>,
    "blindSpots": <honest blind spots inferred from gaps>,
    "teamFitNote": <what team environment suits them>
  }
}`;

  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  return parseJSON<{
    overallScore: number;
    matchLabel: string;
    executiveSummary: string;
    personalityInsights: {
      workStyle: string;
      strengthsNarrative: string;
      blindSpots: string;
      teamFitNote: string;
    };
  }>(raw);
}

export async function generateSkillAnalysis(a: AssessmentAnswers) {
  const prompt = `Based on this profile, generate a skill gap analysis for someone moving from ${a.currentRole} to ${a.targetRole} at a ${a.companyType} company.

Their current skills: ${a.currentSkills.join(', ')}
Their experience: ${a.yearsExperience} years in ${a.industry}

Return ONLY valid JSON:
{
  "skillScores": [
    {
      "dimension": <one of: "Technical Skills"|"Communication"|"Leadership"|"Domain Knowledge"|"Tools & Platforms"|"Soft Skills">,
      "userScore": <0-100, infer from their skills and experience>,
      "targetScore": <0-100, what the target role requires>,
      "gap": <targetScore - userScore>,
      "priority": <"high"|"medium"|"low">,
      "improvementAdvice": <1-2 specific, actionable sentences>
    }
  ],
  "skillGapAnalysis": [
    {
      "skill": <specific skill name>,
      "currentLevel": <"none"|"beginner"|"intermediate"|"advanced">,
      "requiredLevel": <"beginner"|"intermediate"|"advanced"|"expert">,
      "importance": <"critical"|"important"|"nice-to-have">,
      "learningPath": [
        {
          "resource": <specific course/book/project name>,
          "type": <"course"|"book"|"project"|"community">,
          "estimatedHours": <number>,
          "url": <real URL if known, else null>
        }
      ]
    }
  ]
}

Include all 6 dimensions in skillScores. Include 5-8 most important gaps in skillGapAnalysis.`;

  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  return parseJSON<{
    skillScores: Array<{
      dimension: string;
      userScore: number;
      targetScore: number;
      gap: number;
      priority: 'high' | 'medium' | 'low';
      improvementAdvice: string;
    }>;
    skillGapAnalysis: Array<{
      skill: string;
      currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced';
      requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      importance: 'critical' | 'important' | 'nice-to-have';
      learningPath: Array<{
        resource: string;
        type: 'course' | 'book' | 'project' | 'community';
        estimatedHours: number;
        url?: string | null;
      }>;
    }>;
  }>(raw);
}

export async function generateMarketAnalysis(a: AssessmentAnswers) {
  const prompt = `Generate realistic job matches and market analysis for:
Target Role: ${a.targetRole}
Company Type Preference: ${a.companyType}
Location: ${a.locationPreference}
Current Skills: ${a.currentSkills.join(', ')}
Salary Goal: $${a.salaryMin}k–$${a.salaryMax}k
Industry: ${a.industry}

Return ONLY valid JSON:
{
  "opportunityScore": {
    "overall": <0-100>,
    "marketDemand": <0-100, how hot is this role in the market>,
    "skillFit": <0-100, how well do their skills match>,
    "growthPotential": <0-100, career trajectory>,
    "marketInsight": <2 sentences about market conditions>,
    "salaryBenchmark": {
      "min": <realistic market min for role>,
      "max": <realistic market max for role>,
      "median": <realistic median>
    }
  },
  "jobMatches": [
    {
      "title": <specific job title>,
      "company": <real company name relevant to their target>,
      "companyType": <type>,
      "location": <city or "Remote">,
      "salaryMin": <number>,
      "salaryMax": <number>,
      "matchPercent": <75-96>,
      "matchedSkills": [<3-4 skills from their list that match>],
      "gapSkills": [<2-3 skills they're missing>],
      "whyGoodFit": <2 sentences, specific, references their background>
    }
  ],
  "competitiveAnalysis": {
    "percentileRank": <0-100>,
    "topCompetitorSkills": [<4 skills top candidates in this role have>],
    "uniqueAdvantages": [<3 things the user has that are rare/valuable>],
    "differentiationStrategy": <2-3 sentences on how to stand out>
  }
}

Include exactly 5 job matches.`;

  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  return parseJSON<{
    opportunityScore: {
      overall: number;
      marketDemand: number;
      skillFit: number;
      growthPotential: number;
      marketInsight: string;
      salaryBenchmark: { min: number; max: number; median: number };
    };
    jobMatches: Array<{
      title: string;
      company: string;
      companyType: string;
      location: string;
      salaryMin: number;
      salaryMax: number;
      matchPercent: number;
      matchedSkills: string[];
      gapSkills: string[];
      whyGoodFit: string;
      applyUrl?: string;
    }>;
    competitiveAnalysis: {
      percentileRank: number;
      topCompetitorSkills: string[];
      uniqueAdvantages: string[];
      differentiationStrategy: string;
    };
  }>(raw);
}

export async function generateRoadmap(a: AssessmentAnswers, topGaps: string[]) {
  const prompt = `Create a personalized 90-day career action plan for ${a.name} transitioning from ${a.currentRole} to ${a.targetRole}.

Their gaps: ${topGaps.join(', ')}
Their learning style: ${a.learningStyle}
Their timeline: ${a.timeline}
Their top priority: ${a.topPriority}

Return ONLY valid JSON:
{
  "roadmap": [
    {
      "phase": 1,
      "label": "Foundation",
      "weeks": "1-4",
      "theme": <motivating theme specific to their journey>,
      "tasks": [
        {
          "id": "p1-t1",
          "title": <specific action>,
          "description": <1 sentence why this matters for their goal>,
          "estimatedHours": <number>,
          "priority": <"high"|"medium"|"low">,
          "category": <"learn"|"build"|"network"|"apply">,
          "resource": <specific course, book, or platform name>,
          "completed": false
        }
      ]
    },
    { "phase": 2, "label": "Build", "weeks": "5-8", ... },
    { "phase": 3, "label": "Launch", "weeks": "9-12", ... }
  ]
}

Include 4-5 tasks per phase.`;

  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  return parseJSON<{
    roadmap: Array<{
      phase: 1 | 2 | 3;
      label: string;
      weeks: string;
      theme: string;
      tasks: Array<{
        id: string;
        title: string;
        description: string;
        estimatedHours: number;
        priority: 'high' | 'medium' | 'low';
        category: 'learn' | 'build' | 'network' | 'apply';
        resource?: string;
        completed: boolean;
      }>;
    }>;
  }>(raw);
}

export async function generateInterviewQuestions(a: AssessmentAnswers) {
  const prompt = `Generate interview preparation questions for ${a.name} interviewing for ${a.targetRole} at a ${a.companyType} company, coming from ${a.currentRole} background with ${a.yearsExperience} years experience.

Their skills: ${a.currentSkills.join(', ')}

Return ONLY valid JSON:
{
  "interviewQuestions": [
    {
      "type": <"behavioral"|"technical"|"situational"|"cultural">,
      "question": <real interview question for this specific role>,
      "whyAsked": <1 sentence — what the interviewer is evaluating>,
      "frameworkHint": <"Use STAR format"|"Use CAR format"|etc.>,
      "sampleAnswer": <strong 3-4 sentence sample answer that incorporates their actual skills/background>
    }
  ]
}

Include exactly 8 questions — 2 of each type.`;

  const raw = await callClaude(SYSTEM_PROMPT, prompt);
  return parseJSON<{
    interviewQuestions: Array<{
      type: 'behavioral' | 'technical' | 'situational' | 'cultural';
      question: string;
      whyAsked: string;
      frameworkHint: string;
      sampleAnswer: string;
    }>;
  }>(raw);
}
