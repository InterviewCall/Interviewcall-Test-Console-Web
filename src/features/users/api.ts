"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/api/http";
import type {
  CreateUserBody,
  ListUsersParams,
  UpdateUserBody,
  User,
  UserPage,
  UserWithTemporaryPassword,
} from "@/lib/api/types";

export const usersKeys = {
  all: ["users"] as const,
  list: (params: ListUsersParams) => ["users", "list", params] as const,
};

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: async () => (await http.get<UserPage>("/users", { params })).data,
    placeholderData: keepPreviousData,
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
