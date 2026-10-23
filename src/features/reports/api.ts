"use client";

import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import type { TestReport } from "@/lib/api/types";

export const reportKeys = { one: (id: number) => ["test-schedules", "report", id] as const };

/** A submitted test never changes, so a report is fetched once and kept for the visit. */
export function useTestReport(id: number) {
  return useQuery({
    queryKey: reportKeys.one(id),
    queryFn: async () => (await http.get<TestReport>(`/test-schedules/${id}/report`)).data,
    staleTime: Infinity,
    retry: false,
  });
}
