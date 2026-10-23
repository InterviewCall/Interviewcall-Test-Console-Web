"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import type {
  CreateUserBody,
  SessionInfo,
  ListUsersParams,
  UpdateUserBody,
  User,
  UserPage,
  UserWithTemporaryPassword,
} from "@/lib/api/types";

export const usersKeys = {
  all: ["users"] as const,
  list: (params: ListUsersParams) => ["users", "list", params] as const,
  detail: (id: number) => ["users", "detail", id] as const,
  sessions: (id: number) => ["users", "sessions", id] as const,
};

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: async () => (await http.get<UserPage>("/users", { params })).data,
    placeholderData: keepPreviousData,
  });
}

/** One staff member. Admins only. */
export function useUser(id: number) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: async () => (await http.get<User>(`/users/${id}`)).data,
    // Kept in step with the sign-ins beside it: deactivating someone changes both.
    refetchInterval: 30_000,
  });
}

/** The devices a staff member is signed in on. Admins only; read only. */
export function useUserSessions(id: number) {
  return useQuery({
    queryKey: usersKeys.sessions(id),
    queryFn: async () => (await http.get<SessionInfo[]>(`/users/${id}/sessions`)).data,
    // Whether someone is signed in changes while you watch, so keep it fresh.
    refetchInterval: 30_000,
  });
}

function useUsersMutation<TVariables, TResult>(fn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
  });
}

export function useCreateUser() {
  return useUsersMutation(
    async (body: CreateUserBody) => (await http.post<UserWithTemporaryPassword>("/users", body)).data,
  );
}

export function useUpdateUser() {
  return useUsersMutation(
    async ({ id, body }: { id: number; body: UpdateUserBody }) =>
      (await http.patch<User>(`/users/${id}`, body)).data,
  );
}

export function useDeactivateUser() {
  return useUsersMutation(async (id: number) => (await http.post<User>(`/users/${id}/deactivate`)).data);
}

export function useReactivateUser() {
  return useUsersMutation(
    async (id: number) => (await http.post<UserWithTemporaryPassword>(`/users/${id}/reactivate`)).data,
  );
}

export function useResetPassword() {
  return useUsersMutation(
    async (id: number) => (await http.post<UserWithTemporaryPassword>(`/users/${id}/reset-password`)).data,
  );
}
