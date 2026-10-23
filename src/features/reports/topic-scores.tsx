import type { ReportTopic } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { topicHighlights, topicPercent } from "./report-math";

/** One bar per topic on the same 0 to 100 scale as the score, with the pass mark ticked on each. */
export function TopicScores({ topics, passPercent }: { topics: ReportTopic[]; passPercent: number }) {
  const highlights = topicHighlights(topics);

  return (
    <section aria-labelledby="topic-scores" className="rounded-panel border border-line bg-surface p-5 shadow-card sm:p-6 print:break-inside-avoid print:p-3">
      <h3 id="topic-scores" className="font-display text-lg font-semibold">
        Score by topic
      </h3>
      <p className="mt-0.5 text-[13px] text-ink-muted">Each bar is the share of that topic’s marks earned. The tick marks the pass mark.</p>

      <ul className="mt-3 divide-y divide-line">
        {topics.map((topic) => {
          const percent = topicPercent(topic);
          const meets = percent >= passPercent;
          return (
            <li key={topic.topic} className="grid items-center gap-x-5 gap-y-1.5 py-3 print:py-0.5 sm:grid-cols-[13rem_1fr_6.5rem]">
              <span className="text-sm font-semibold">{topic.topic}</span>
              <div
                role="img"
                aria-label={`${percent} percent of marks, ${meets ? "at or above" : "below"} the pass mark`}
                className="relative h-2.5 rounded-full bg-sunken ring-1 ring-inset ring-line"
              >
                <div className={cn("absolute inset-y-0 left-0 rounded-full", meets ? "bg-primary" : "bg-bar-below")} style={{ width: `${percent}%` }} />
                <div className="absolute -inset-y-1 w-0.5 rounded-full bg-ink/55" style={{ left: `${passPercent}%` }} />
              </div>
              <span className="text-[13px] text-ink-muted sm:text-right">
                <strong className="block text-sm font-semibold text-ink">
                  {topic.obtainedMarks} / {topic.totalMarks}
                </strong>
                {topic.correct} of {topic.questions} correct
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-2 flex flex-wrap print:mt-1 gap-x-5 gap-y-1 text-xs text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
          At or above the pass mark
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-bar-below" />
          Below it
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-0.5 rounded-full bg-ink/55" />
          Pass mark ({passPercent}%)
        </span>
      </div>

      {highlights ? (
        <div className="mt-5 grid gap-3 print:mt-2 sm:grid-cols-2">
          <div className="rounded-control bg-primary-tint px-4 py-3">
            <p className="text-xs font-semibold text-ink-muted">Strongest</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold">{highlights.strongest.names.join(", ")}</p>
            <p className="text-xs text-ink-muted">{highlights.strongest.percent}% of marks</p>
          </div>
          <div className="rounded-control bg-warning-tint px-4 py-3">
            <p className="text-xs font-semibold text-warning">Needs most work</p>
            <p className="mt-0.5 font-display text-[15px] font-semibold">{highlights.weakest.names.join(", ")}</p>
            <p className="text-xs text-ink-muted">{highlights.weakest.percent}% of marks</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
