"use client";

import { useId, useState } from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { Icon } from "@/components/ui/icon";
import { Markdown } from "@/components/ui/markdown";
import type { ReportQuestion, ReportTopic } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const STATUS = {
  correct: { label: "Correct", tone: "text-success" },
  wrong: { label: "Incorrect", tone: "text-danger" },
  blank: { label: "Not answered", tone: "text-ink-muted" },
} as const;

function StatusIcon({ status }: { status: ReportQuestion["status"] }) {
  if (status === "blank") {
    return (
      <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-line-strong" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.4 2.2" />
      </svg>
    );
  }
  const ok = status === "correct";
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full border", ok ? "border-success bg-success-tint text-success" : "border-danger bg-danger-tint text-danger")}
    >
      <Icon name={ok ? "check" : "x"} size={12} />
    </span>
  );
}

/** Plain text of a markdown snippet, for the one-line summaries. */
function plain(markdown: string): string {
  return markdown.replace(/[`*_#>]/g, "").replace(/\s+/g, " ").trim();
}

function QuestionRow({ question, language, onLanguage }: { question: ReportQuestion; language: string; onLanguage: (language: string) => void }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const chosen = question.options.find((option) => option.chosen);
  const right = question.options.find((option) => option.isCorrect);
  const status = STATUS[question.status];

  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="grid w-full grid-cols-[1.25rem_1fr_auto] items-start gap-3 px-1 py-3 text-left transition-colors hover:bg-sunken print:hover:bg-transparent"
      >
        <span className="mt-0.5">
          <StatusIcon status={question.status} />
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-[13px] font-semibold">
              <span className="font-medium text-ink-faint">Q{question.number}</span> {question.code}
            </span>
            <span className={cn("text-[13px] font-semibold", status.tone)}>{status.label}</span>
          </span>
          {question.status === "wrong" && chosen ? (
            <span className="mt-1 block line-clamp-2 text-[13px] text-ink-muted">
              <b className="font-semibold text-ink">Chose</b> {plain(chosen.textMd)}
            </span>
          ) : null}
          {question.status !== "correct" && right ? (
            <span className="mt-1 block line-clamp-2 text-[13px] text-ink-muted">
              <b className="font-semibold text-ink">Correct answer</b> {plain(right.textMd)}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-2 pt-0.5 text-sm font-semibold">
          <span>
            {question.marks}
            <span className="font-medium text-ink-faint"> / {question.totalMarks}</span>
          </span>
          <Icon name="chevron-down" size={16} className={cn("text-ink-faint transition-transform print:hidden", open && "rotate-180")} />
        </span>
      </button>

      {open ? (
        <div id={panelId} className="mb-3 ml-8 rounded-control border border-line bg-sunken p-4 print:hidden">
          <Markdown className="text-[13px]">{question.statementMd}</Markdown>
          {question.codeStubs?.length ? <CodeBlock stubs={question.codeStubs} language={language} onLanguage={onLanguage} /> : null}
          <ul className="mt-4 grid gap-2">
            {question.options.map((option) => (
              <li
                key={option.id}
                className={cn(
                  "flex items-start gap-2.5 rounded-control border px-3 py-2 text-[13px]",
                  option.isCorrect ? "border-success/50 bg-success-tint" : option.chosen ? "border-danger/50 bg-danger-tint" : "border-line bg-surface",
                )}
              >
                <span className="mt-0.5 w-20 shrink-0 text-xs font-semibold">
                  {option.isCorrect && option.chosen ? <span className="text-success">Chosen · right</span> : null}
                  {option.isCorrect && !option.chosen ? <span className="text-success">Right answer</span> : null}
                  {!option.isCorrect && option.chosen ? <span className="text-danger">Chosen</span> : null}
                </span>
                <Markdown className="min-w-0 flex-1">{option.textMd}</Markdown>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/** Every question, grouped by topic in the order the candidate saw them. Open a row to read the question. */
export function QuestionReview({ topics }: { topics: ReportTopic[] }) {
  // One language for the whole review: pick it once and every open question follows.
  const [language, setLanguage] = useState("cpp");
  return (
    <section aria-labelledby="question-review" className="rounded-panel border border-line bg-surface p-5 shadow-card sm:p-6 print:break-before-page">
      <h3 id="question-review" className="font-display text-lg font-semibold">
        Question review
      </h3>
      <p className="mt-0.5 text-[13px] text-ink-muted">
        What the candidate chose against the answer key. A wrong or blank answer scores zero and nothing is deducted. Open a question to read it in full.
      </p>

      <div className="mt-2 divide-y-0">
        {topics.map((topic) => (
          <div key={topic.topic} className="mt-5 break-inside-avoid-page">
            <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-1.5">
              <h4 className="font-display text-[15px] font-semibold">{topic.topic}</h4>
              <span className="text-xs text-ink-muted">
                {topic.correct} of {topic.questions} correct · {topic.obtainedMarks}/{topic.totalMarks} marks
              </span>
            </div>
            <ul>
              {topic.items.map((question) => (
                <QuestionRow key={question.questionVersionId} question={question} language={language} onLanguage={setLanguage} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
