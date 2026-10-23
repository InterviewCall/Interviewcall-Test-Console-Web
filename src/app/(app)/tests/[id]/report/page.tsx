import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportScreen } from "@/features/reports/report-screen";

export const instant = false;

export const metadata: Metadata = { title: "Report" };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scheduleId = Number(id);
  if (!Number.isInteger(scheduleId) || scheduleId <= 0) notFound();
  return <ReportScreen id={scheduleId} />;
}
