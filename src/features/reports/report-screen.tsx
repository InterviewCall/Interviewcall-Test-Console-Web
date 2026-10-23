"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/errors";
import { useTestReport } from "./api";
import { QuestionReview } from "./question-review";
import { ReportFacts, ReportHero } from "./report-hero";
import { TopicScores } from "./topic-scores";

function BackLink() {
  return (
    <Link href="/tests" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline print:hidden">
      <Icon name="chevron-left" size={16} />
      Back to tests
    </Link>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading the report">
      <Skeleton className="h-64 rounded-sheet" />
      <Skeleton className="h-24 rounded-panel" />
      <Skeleton className="h-80 rounded-panel" />
    </div>
  );
}

function Unavailable({ error }: { error: unknown }) {
  const api = error instanceof ApiError ? error : null;
  if (api?.code === "REPORT_NOT_READY") {
    return (
      <EmptyState icon="clock" title="No report yet" action={<BackLink />}>
        The report appears once the candidate has submitted the test, or when their time runs out.
      </EmptyState>
    );
  }
  if (api?.status === 404) {
    return (
      <EmptyState icon="search" title="Test not found" action={<BackLink />}>
        It may have been removed, or it belongs to another advisor.
      </EmptyState>
    );
  }
  return (
    <EmptyState icon="alert" title="Couldn’t load the report" action={<BackLink />}>
      {api?.message ?? "Something went wrong. Try again in a moment."}
    </EmptyState>
  );
}

export function ReportScreen({ id }: { id: number }) {
  const report = useTestReport(id);

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <BackLink />
      <PageHeader
        title="Report"
        description="For staff only. It shows the answer key, so it is never shared with candidates."
        actions={
          report.data ? (
            <Button variant="secondary" icon="download" onClick={() => window.print()} className="print:hidden">
              Download PDF
            </Button>
          ) : undefined
        }
      />

      {report.isPending ? <Loading /> : null}
      {report.isError ? <Unavailable error={report.error} /> : null}
      {report.data ? (
        <>
          <ReportHero report={report.data} />
          <ReportFacts report={report.data} />
          <TopicScores topics={report.data.topics} passPercent={report.data.template.passPercent} />
          <QuestionReview topics={report.data.topics} />
        </>
      ) : null}
    </div>
  );
}
