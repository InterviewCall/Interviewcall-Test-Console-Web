import type { ReportTopic, TestReport } from "@/lib/api/types";

/** The share of a topic's marks that were earned, to one decimal. */
export function topicPercent(topic: Pick<ReportTopic, "obtainedMarks" | "totalMarks">): number {
  return topic.totalMarks > 0 ? Math.round((topic.obtainedMarks / topic.totalMarks) * 1000) / 10 : 0;
}

/** "9 min 41 s", or "48 s" under a minute. */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes} min ${String(rest).padStart(2, "0")} s` : `${rest} s`;
}

export function secondsUsed(report: Pick<TestReport, "attempt">): number {
  return Math.max(0, Math.round((new Date(report.attempt.submittedAt).getTime() - new Date(report.attempt.startedAt).getTime()) / 1000));
}

/** Percent shown as "58.3", never "58.30" and never "58.0". */
export function percentText(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/**
 * Strongest and weakest topics, read from the same numbers as the bars. Topics that tie are all
 * listed, never one picked at random; if every topic scored the same there is nothing to point at.
 */
export function topicHighlights(topics: ReportTopic[]): { strongest: { names: string[]; percent: number }; weakest: { names: string[]; percent: number } } | null {
  if (topics.length < 2) return null;
  const percents = topics.map(topicPercent);
  const best = Math.max(...percents);
  const worst = Math.min(...percents);
  if (best === worst) return null;
  const named = (value: number) => topics.filter((topic) => topicPercent(topic) === value).map((topic) => topic.topic);
  return { strongest: { names: named(best), percent: best }, weakest: { names: named(worst), percent: worst } };
}

export function countAnswers(topics: ReportTopic[]) {
  const questions = topics.reduce((sum, topic) => sum + topic.questions, 0);
  const answered = topics.reduce((sum, topic) => sum + topic.answered, 0);
  const correct = topics.reduce((sum, topic) => sum + topic.correct, 0);
  return { questions, answered, correct };
}
