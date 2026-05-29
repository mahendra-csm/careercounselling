'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Report } from '@/types/report';

// Register fonts (use standard PDF fonts to avoid font loading issues)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FAFAFB',
    padding: 0,
  },
  // Header bar
  headerBar: {
    backgroundColor: '#E0242E',
    height: 6,
    width: '100%',
  },
  // Cover page
  coverRed: {
    backgroundColor: '#E0242E',
    padding: 48,
    paddingBottom: 32,
  },
  coverLogo: { fontSize: 14, color: '#FFFFFF', fontFamily: 'Helvetica-Bold', marginBottom: 32 },
  coverTitle: { fontSize: 28, color: '#FFFFFF', fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  coverSub: { fontSize: 16, color: '#FCECED', fontFamily: 'Helvetica', marginBottom: 4 },
  coverDate: { fontSize: 10, color: '#F4D4D6', fontFamily: 'Helvetica' },
  coverWhite: { backgroundColor: '#FFFFFF', padding: 48, flex: 1 },
  coverStats: { flexDirection: 'row', gap: 12, marginTop: 8 },
  coverStat: { flex: 1, backgroundColor: '#FAFAFB', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E9E9ED' },
  coverStatVal: { fontSize: 20, color: '#E0242E', fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  coverStatLabel: { fontSize: 9, color: '#6C6E78', fontFamily: 'Helvetica' },

  // Section styles
  sectionPadding: { padding: 36 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sectionAccent: { width: 4, height: 20, backgroundColor: '#E0242E', borderRadius: 2 },
  sectionTitle: { fontSize: 16, color: '#18191D', fontFamily: 'Helvetica-Bold' },

  // Text
  body: { fontSize: 9.5, color: '#3C3D44', lineHeight: 1.6, fontFamily: 'Helvetica', marginBottom: 8 },
  bodyBold: { fontSize: 9.5, color: '#18191D', fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  label: { fontSize: 8, color: '#9B9DA6', fontFamily: 'Helvetica', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 },
  small: { fontSize: 8, color: '#6C6E78', fontFamily: 'Helvetica' },

  // Card
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E9E9ED', padding: 12, marginBottom: 8 },
  redCard: { backgroundColor: '#FCECED', borderRadius: 8, borderWidth: 1, borderColor: '#F4D4D6', padding: 12, marginBottom: 8 },

  // Table
  row: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  col1: { flex: 1.5 },
  col2: { flex: 1 },

  // Progress bar
  progressBg: { height: 6, backgroundColor: '#E9E9ED', borderRadius: 3, marginTop: 2 },
  progressFill: { height: 6, backgroundColor: '#E0242E', borderRadius: 3 },

  // Badge
  badge: { backgroundColor: '#FCECED', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 7.5, color: '#E0242E', fontFamily: 'Helvetica-Bold' },
  successBadge: { backgroundColor: '#EDFAF4', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  successBadgeText: { fontSize: 7.5, color: '#1F9254', fontFamily: 'Helvetica-Bold' },

  // Footer
  footer: {
    position: 'absolute', bottom: 20, left: 36, right: 36,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontSize: 8, color: '#9B9DA6', fontFamily: 'Helvetica' },
  footerPage: { fontSize: 8, color: '#9B9DA6', fontFamily: 'Helvetica' },

  // Grid
  grid2: { flexDirection: 'row', gap: 8 },
  gridCell: { flex: 1 },

  // Bullet
  bullet: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  bulletDot: { fontSize: 9, color: '#E0242E', fontFamily: 'Helvetica-Bold', marginTop: 1 },
  bulletText: { fontSize: 9, color: '#3C3D44', fontFamily: 'Helvetica', flex: 1, lineHeight: 1.5 },
});

function PageFooter({ pageNum, total, userName }: { pageNum: number; total: number; userName: string }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{userName} · OneGrasp Career Intelligence Report</Text>
      <Text style={styles.footerPage}>Page {pageNum} of {total}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ScoreBar({ score, color = '#E0242E' }: { score: number; color?: string }) {
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${Math.min(score, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

interface PDFProps { report: Report }

export function ReportPDFDocument({ report }: PDFProps) {
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  const TOTAL = 10;

  return (
    <Document title={`OneGrasp Report — ${report.userName}`} author="OneGrasp">

      {/* PAGE 1 — COVER */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverRed}>
          <Text style={styles.coverLogo}>OneGrasp</Text>
          <Text style={styles.coverTitle}>CAREER INTELLIGENCE{'\n'}REPORT</Text>
          <Text style={[styles.coverSub, { marginTop: 8 }]}>{report.userName}</Text>
          <Text style={styles.coverSub}>{report.targetRole}</Text>
          <Text style={[styles.coverDate, { marginTop: 8 }]}>
            Generated {new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.coverWhite}>
          <Text style={styles.bodyBold}>Your career snapshot</Text>
          <View style={styles.coverStats}>
            <View style={styles.coverStat}>
              <Text style={styles.coverStatVal}>{report.overallScore}/100</Text>
              <Text style={styles.coverStatLabel}>Overall Score</Text>
            </View>
            <View style={styles.coverStat}>
              <Text style={styles.coverStatVal}>{report.jobMatches?.[0]?.matchPercent ?? 0}%</Text>
              <Text style={styles.coverStatLabel}>Top Match · {report.jobMatches?.[0]?.company ?? '—'}</Text>
            </View>
            <View style={styles.coverStat}>
              <Text style={styles.coverStatVal}>{report.skillGapAnalysis?.length ?? 0}</Text>
              <Text style={styles.coverStatLabel}>Skill Gaps Found</Text>
            </View>
          </View>
          <View style={[styles.redCard, { marginTop: 16 }]}>
            <Text style={[styles.label, { color: '#E0242E', marginBottom: 4 }]}>Career Match</Text>
            <Text style={styles.bodyBold}>{report.matchLabel}</Text>
          </View>
        </View>
        <PageFooter pageNum={1} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 2 — EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Executive Summary" />
          {(report.executiveSummary || '').split('\n\n').filter(Boolean).map((para, i) => (
            <Text key={i} style={[styles.body, { marginBottom: 10 }]}>{para}</Text>
          ))}
          <View style={[styles.grid2, { marginTop: 8 }]}>
            <View style={[styles.card, styles.gridCell]}>
              <Text style={styles.label}>Years Experience</Text>
              <Text style={styles.bodyBold}>{report.yearsExperience} years</Text>
              <Text style={styles.label}>Current Role</Text>
              <Text style={styles.bodyBold}>{report.currentRole}</Text>
              <Text style={styles.label}>Industry</Text>
              <Text style={styles.bodyBold}>{report.industry}</Text>
            </View>
            <View style={[styles.card, styles.gridCell]}>
              <Text style={styles.label}>Target Role</Text>
              <Text style={styles.bodyBold}>{report.targetRole}</Text>
              <Text style={styles.label}>Timeline</Text>
              <Text style={styles.bodyBold}>{report.timeline}</Text>
              <Text style={styles.label}>Top Priority</Text>
              <Text style={styles.bodyBold}>{report.topPriority}</Text>
            </View>
          </View>
        </View>
        <PageFooter pageNum={2} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 3 — SKILL SNAPSHOT */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Skill Snapshot" />
          <Text style={styles.body}>Your performance across 6 key dimensions, benchmarked against {report.targetRole} requirements.</Text>
          {(report.skillScores || []).map((s, i) => (
            <View key={i} style={[styles.card, { marginBottom: 6 }]}>
              <View style={[styles.row, { marginBottom: 4 }]}>
                <Text style={[styles.bodyBold, { flex: 2 }]}>{s.dimension}</Text>
                <View style={[styles.badge, { marginRight: 4 }]}>
                  <Text style={styles.badgeText}>{s.priority} priority</Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.col1}>
                  <Text style={styles.label}>Your score: {s.userScore}/100</Text>
                  <ScoreBar score={s.userScore} color="#E0242E" />
                </View>
                <View style={styles.col1}>
                  <Text style={styles.label}>Target: {s.targetScore}/100</Text>
                  <ScoreBar score={s.targetScore} color="#9B9DA6" />
                </View>
              </View>
              {s.improvementAdvice && (
                <Text style={[styles.small, { marginTop: 4, fontStyle: 'italic' }]}>{s.improvementAdvice}</Text>
              )}
            </View>
          ))}
        </View>
        <PageFooter pageNum={3} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 4 — SKILL GAP DEEP DIVE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Skill Gap Deep Dive" />
          {(report.skillGapAnalysis || []).slice(0, 6).map((gap, i) => (
            <View key={i} style={[styles.card, { marginBottom: 6 }]}>
              <View style={[styles.row, { marginBottom: 2 }]}>
                <Text style={[styles.bodyBold, { flex: 2 }]}>{gap.skill}</Text>
                <View style={gap.importance === 'critical' ? styles.badge : styles.successBadge}>
                  <Text style={gap.importance === 'critical' ? styles.badgeText : styles.successBadgeText}>
                    {gap.importance}
                  </Text>
                </View>
              </View>
              <Text style={styles.small}>
                {gap.currentLevel} → {gap.requiredLevel} required
              </Text>
              {(gap.learningPath || []).slice(0, 2).map((lp, j) => (
                <View key={j} style={styles.bullet}>
                  <Text style={styles.bulletDot}>→</Text>
                  <Text style={styles.bulletText}>{lp.resource} ({lp.type}, ~{lp.estimatedHours}h)</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <PageFooter pageNum={4} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 5 — OPPORTUNITY SCORE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Opportunity Score & Market Analysis" />
          {report.opportunityScore && (
            <>
              <View style={[styles.grid2, { marginBottom: 12 }]}>
                <View style={[styles.card, styles.gridCell, { alignItems: 'center' }]}>
                  <Text style={[styles.coverStatVal, { fontSize: 36, marginBottom: 2 }]}>{report.opportunityScore.overall}</Text>
                  <Text style={[styles.label, { textAlign: 'center' }]}>Overall Opportunity</Text>
                </View>
                <View style={[styles.card, styles.gridCell]}>
                  <Text style={styles.label}>Market Demand</Text>
                  <Text style={styles.bodyBold}>{report.opportunityScore.marketDemand}/100</Text>
                  <ScoreBar score={report.opportunityScore.marketDemand} color="#E0242E" />
                  <Text style={[styles.label, { marginTop: 6 }]}>Skill Fit</Text>
                  <Text style={styles.bodyBold}>{report.opportunityScore.skillFit}/100</Text>
                  <ScoreBar score={report.opportunityScore.skillFit} color="#C9820B" />
                  <Text style={[styles.label, { marginTop: 6 }]}>Growth Potential</Text>
                  <Text style={styles.bodyBold}>{report.opportunityScore.growthPotential}/100</Text>
                  <ScoreBar score={report.opportunityScore.growthPotential} color="#1F9254" />
                </View>
              </View>
              {report.opportunityScore.marketInsight && (
                <Text style={[styles.body, { marginBottom: 12 }]}>{report.opportunityScore.marketInsight}</Text>
              )}
              <SectionHeader title="Salary Benchmark" />
              <View style={styles.grid2}>
                <View style={[styles.card, styles.gridCell]}>
                  <Text style={styles.label}>Market min</Text>
                  <Text style={styles.bodyBold}>{fmt(report.opportunityScore.salaryBenchmark.min)}</Text>
                </View>
                <View style={[styles.redCard, styles.gridCell]}>
                  <Text style={[styles.label, { color: '#E0242E' }]}>Market median</Text>
                  <Text style={[styles.bodyBold, { color: '#E0242E' }]}>{fmt(report.opportunityScore.salaryBenchmark.median)}</Text>
                </View>
                <View style={[styles.card, styles.gridCell]}>
                  <Text style={styles.label}>Market max</Text>
                  <Text style={styles.bodyBold}>{fmt(report.opportunityScore.salaryBenchmark.max)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
        <PageFooter pageNum={5} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 6 — JOB MATCHES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Top Job Matches" />
          {(report.jobMatches || []).map((job, i) => (
            <View key={i} style={[styles.card, { marginBottom: 6 }]}>
              <View style={[styles.row, { marginBottom: 2 }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.bodyBold}>{job.title}</Text>
                  <Text style={styles.small}>{job.company} · {job.location}</Text>
                </View>
                <View>
                  <View style={job.matchPercent >= 85 ? styles.successBadge : styles.badge}>
                    <Text style={job.matchPercent >= 85 ? styles.successBadgeText : styles.badgeText}>
                      {job.matchPercent}% match
                    </Text>
                  </View>
                  <Text style={[styles.small, { marginTop: 2 }]}>
                    {fmt(job.salaryMin)} – {fmt(job.salaryMax)}
                  </Text>
                </View>
              </View>
              {job.whyGoodFit && <Text style={[styles.small, { fontStyle: 'italic', marginTop: 3 }]}>{job.whyGoodFit}</Text>}
            </View>
          ))}
        </View>
        <PageFooter pageNum={6} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 7 — 90-DAY ROADMAP */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="90-Day Action Roadmap" />
          {(report.roadmap || []).map((phase) => (
            <View key={phase.phase} style={{ marginBottom: 10 }}>
              <View style={styles.redCard}>
                <Text style={[styles.bodyBold, { color: '#E0242E' }]}>
                  Phase {phase.phase}: {phase.label} (Weeks {phase.weeks})
                </Text>
                {phase.theme && <Text style={[styles.small, { fontStyle: 'italic', marginTop: 2 }]}>{phase.theme}</Text>}
              </View>
              {phase.tasks.slice(0, 4).map((task) => (
                <View key={task.id} style={styles.bullet}>
                  <Text style={styles.bulletDot}>→</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bodyBold}>{task.title}</Text>
                    <Text style={styles.small}>{task.description} · ~{task.estimatedHours}h · {task.priority} priority</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
        <PageFooter pageNum={7} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 8 — INTERVIEW PREP */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Interview Preparation" />
          {(report.interviewQuestions || []).map((q, i) => (
            <View key={i} style={[styles.card, { marginBottom: 6 }]}>
              <View style={[styles.row, { marginBottom: 3 }]}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{q.type}</Text>
                </View>
                <Text style={[styles.small, { marginLeft: 6, alignSelf: 'center' }]}>{q.frameworkHint}</Text>
              </View>
              <Text style={styles.bodyBold}>{q.question}</Text>
              {q.whyAsked && <Text style={[styles.small, { marginTop: 2 }]}>Why asked: {q.whyAsked}</Text>}
              {q.sampleAnswer && (
                <Text style={[styles.small, { fontStyle: 'italic', marginTop: 4, color: '#3C3D44' }]}>
                  Sample: {q.sampleAnswer.substring(0, 200)}{q.sampleAnswer.length > 200 ? '...' : ''}
                </Text>
              )}
            </View>
          ))}
        </View>
        <PageFooter pageNum={8} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 9 — COMPETITIVE ANALYSIS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Competitive Analysis & Positioning" />
          {report.competitiveAnalysis && (
            <>
              <View style={[styles.card, { marginBottom: 10 }]}>
                <Text style={styles.label}>Percentile Rank vs Peers</Text>
                <Text style={[styles.coverStatVal, { fontSize: 28 }]}>{report.competitiveAnalysis.percentileRank}th percentile</Text>
                <ScoreBar score={report.competitiveAnalysis.percentileRank} color="#E0242E" />
              </View>

              <Text style={styles.bodyBold}>Your Unique Advantages</Text>
              {report.competitiveAnalysis.uniqueAdvantages?.map((adv, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletDot}>✓</Text>
                  <Text style={[styles.bulletText, { color: '#1F9254' }]}>{adv}</Text>
                </View>
              ))}

              <Text style={[styles.bodyBold, { marginTop: 8 }]}>What Top Candidates Have</Text>
              {report.competitiveAnalysis.topCompetitorSkills?.map((s, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={[styles.bulletDot, { color: '#C9820B' }]}>→</Text>
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ))}

              {report.competitiveAnalysis.differentiationStrategy && (
                <View style={[styles.redCard, { marginTop: 10 }]}>
                  <Text style={[styles.label, { color: '#E0242E' }]}>Differentiation Strategy</Text>
                  <Text style={styles.body}>{report.competitiveAnalysis.differentiationStrategy}</Text>
                </View>
              )}
            </>
          )}
        </View>
        <PageFooter pageNum={9} total={TOTAL} userName={report.userName} />
      </Page>

      {/* PAGE 10 — PERSONALITY INSIGHTS & NEXT STEPS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar} />
        <View style={styles.sectionPadding}>
          <SectionHeader title="Personality Insights & Next Steps" />
          {report.personalityInsights && (
            <View style={[styles.grid2, { marginBottom: 12 }]}>
              <View style={[styles.card, styles.gridCell]}>
                <Text style={[styles.label, { color: '#E0242E' }]}>Work Style</Text>
                <Text style={styles.body}>{report.personalityInsights.workStyle}</Text>
              </View>
              <View style={[styles.card, styles.gridCell]}>
                <Text style={[styles.label, { color: '#1F9254' }]}>Strengths</Text>
                <Text style={styles.body}>{report.personalityInsights.strengthsNarrative}</Text>
              </View>
              <View style={[styles.card, styles.gridCell]}>
                <Text style={[styles.label, { color: '#C9820B' }]}>Blind Spots</Text>
                <Text style={styles.body}>{report.personalityInsights.blindSpots}</Text>
              </View>
              <View style={[styles.card, styles.gridCell]}>
                <Text style={[styles.label]}>Team Fit</Text>
                <Text style={styles.body}>{report.personalityInsights.teamFitNote}</Text>
              </View>
            </View>
          )}

          <SectionHeader title="Recommended First Steps This Week" />
          {(report.roadmap?.[0]?.tasks || []).filter(t => t.priority === 'high').slice(0, 3).map((task) => (
            <View key={task.id} style={styles.bullet}>
              <Text style={styles.bulletDot}>1.</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bodyBold}>{task.title}</Text>
                <Text style={styles.small}>{task.description}</Text>
              </View>
            </View>
          ))}

          <View style={[styles.redCard, { marginTop: 16 }]}>
            <Text style={[styles.bodyBold, { color: '#E0242E', marginBottom: 4 }]}>You&apos;ve got this, {report.userName.split(' ')[0]}.</Text>
            <Text style={styles.body}>
              This report is your unfair advantage. Execute the roadmap, close the skill gaps, and show up
              to every interview knowing exactly what sets you apart. The career you want is {report.timeline} away — and now you know exactly how to get there.
            </Text>
            <Text style={[styles.small, { marginTop: 8, color: '#E0242E' }]}>onegrasp.app</Text>
          </View>
        </View>
        <PageFooter pageNum={10} total={TOTAL} userName={report.userName} />
      </Page>

    </Document>
  );
}
