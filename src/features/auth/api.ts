"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import { hardNavigate } from "@/lib/navigation";
import type { ChangePasswordBody, LoginBody, SessionInfo, User } from "@/lib/api/types";

export const authKeys = {
  me: ["auth", "me"] as const,
  sessions: ["auth", "sessions"] as const,
};

/** The signed-in user. A 401 error here just means "not signed in". */
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => (await http.get<User>("/auth/me")).data,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (body: LoginBody) => (await http.post<User>("/auth/login", body)).data,
    onSuccess: (user) => {
      queryClient.clear();
      queryClient.setQueryData(authKeys.me, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await http.post("/auth/logout");
    },
    onSettled: () => {
      queryClient.clear();
      hardNavigate("/login");
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ChangePasswordBody) =>
      (await http.post<User>("/auth/change-password", body)).data,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      void queryClient.invalidateQueries({ queryKey: authKeys.sessions });
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: authKeys.sessions,
    queryFn: async () => (await http.get<SessionInfo[]>("/auth/sessions")).data,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/auth/sessions/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.sessions }),
  });
}
