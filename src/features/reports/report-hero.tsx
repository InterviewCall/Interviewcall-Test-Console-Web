import type { TestReport } from "@/lib/api/types";
import { formatIstDate, formatIstTime } from "@/features/tests/ist";
import { LEVEL_LABEL } from "@/features/tests/labels";
import { countAnswers, formatDuration, percentText, secondsUsed } from "./report-math";

function Contact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-white/60">{label}</dt>
      <dd className="min-w-0 break-words text-white/90">{children}</dd>
    </div>
  );
}

/** Who took it, what they scored, and where that sits against the pass mark. */
export function ReportHero({ report }: { report: TestReport }) {
  const { candidate, result, template } = report;
  const gauge = Math.min(100, Math.max(0, result.percentage));

  return (
    <section className="overflow-hidden rounded-sheet bg-brand p-6 text-white shadow-card sm:p-8">
      <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{candidate.fullName}</h2>
          <p className="mt-1.5 text-[15px] text-white/75">
            {LEVEL_LABEL[report.level]} level · taken {formatIstDate(report.attempt.startedAt)}
          </p>
          <dl className="mt-5 grid gap-1 text-[13px]">
            <Contact label="Email">{candidate.email}</Contact>
            {candidate.phone ? <Contact label="Phone">{candidate.phone}</Contact> : null}
            <Contact label="Experience">
              {candidate.workExperienceYears} {candidate.workExperienceYears === 1 ? "year" : "years"}
            </Contact>
            <Contact label="Scheduled by">{report.advisor}</Contact>
          </dl>
        </div>

        <div className="sm:text-right">
          <p className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
            {percentText(result.percentage)}
            <span className="ml-0.5 text-3xl font-medium text-white/70">%</span>
          </p>
          <p className="mt-2 text-sm text-white/75">
            {result.obtainedMarks} of {result.totalMarks} marks
          </p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-highlighter px-3.5 py-1.5 text-[13px] font-semibold text-on-highlighter">
            <span aria-hidden="true" className={`size-2 rounded-full ${result.passed ? "bg-success" : "bg-bar-below"}`} />
            {result.passed ? "Meets the pass mark" : "Below the pass mark"}
          </p>
        </div>
      </div>

      <div className="mt-8" role="img" aria-label={`Scored ${percentText(result.percentage)} percent; the pass mark is ${template.passPercent} percent`}>
        <div className="relative h-4">
          <span className="absolute -translate-x-1/2 whitespace-nowrap text-[11px] text-white/70" style={{ left: `${template.passPercent}%` }}>
            Pass mark {template.passPercent}%
          </span>
        </div>
        <div className="relative h-2.5 rounded-full bg-white/15">
          <div className="absolute inset-y-0 left-0 rounded-full bg-highlighter" style={{ width: `${gauge}%` }} />
          <div className="absolute -inset-y-1 w-0.5 rounded-full bg-white" style={{ left: `${template.passPercent}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-white/55">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </section>
  );
}

/** The facts around the score: how long, how much was answered, how it ended. */
export function ReportFacts({ report }: { report: TestReport }) {
  const { questions, answered, correct } = countAnswers(report.topics);
  const timedOut = report.attempt.submitReason === "TIMEOUT";
  const facts = [
    { label: "Time used", value: formatDuration(secondsUsed(report)), sub: `of ${report.template.durationMinutes} min allowed` },
    { label: "Answered", value: `${answered} of ${questions}`, sub: `${correct} correct` },
    { label: "Started", value: formatIstTime(report.attempt.startedAt), sub: `${formatIstDate(report.attempt.startedAt)} · IST` },
    {
      label: "Ended",
      value: timedOut ? "Time ran out" : "Submitted",
      sub: timedOut ? "Saved answers were scored" : `at ${formatIstTime(report.attempt.submittedAt)}`,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="bg-sunken px-4 py-3.5">
          <dt className="text-xs text-ink-muted">{fact.label}</dt>
          <dd className="mt-1 font-display text-lg font-semibold leading-tight">{fact.value}</dd>
          <dd className="text-xs text-ink-muted">{fact.sub}</dd>
        </div>
      ))}
    </dl>
  );
}
