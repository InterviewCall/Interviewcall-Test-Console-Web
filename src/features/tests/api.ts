"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import type {
  ListTestSchedulesParams,
  NewTestLink,
  RescheduleTestBody,
  ScheduleTestBody,
  ScheduleWithEmailStatus,
  TestSchedulePage,
} from "@/lib/api/types";

export const testsKeys = {
  all: ["test-schedules"] as const,
  list: (params: ListTestSchedulesParams) => ["test-schedules", "list", params] as const,
};

export function useTestSchedules(params: ListTestSchedulesParams) {
  return useQuery({
    queryKey: testsKeys.list(params),
    queryFn: async () => (await http.get<TestSchedulePage>("/test-schedules", { params })).data,
    placeholderData: keepPreviousData,
  });
}

export function useScheduleTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ScheduleTestBody) => (await http.post<ScheduleWithEmailStatus>("/test-schedules", body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: testsKeys.all }),
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await http.post<ScheduleWithEmailStatus>(`/test-schedules/${id}/resend-email`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: testsKeys.all }),
  });
}

/** Nothing in the list changes when a link is made, so there is nothing to refetch. */
export function useNewTestLink() {
  return useMutation({
    mutationFn: async (id: number) => (await http.post<NewTestLink>(`/test-schedules/${id}/new-link`)).data,
  });
}

export function useRescheduleTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: RescheduleTestBody }) =>
      (await http.post<ScheduleWithEmailStatus>(`/test-schedules/${id}/reschedule`, body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: testsKeys.all }),
  });
}
