import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/errors";
import { hardNavigate } from "@/lib/navigation";

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  const here = window.location.pathname + window.location.search;
  if (window.location.pathname === "/login") return;
  const next = here === "/" ? "" : `?next=${encodeURIComponent(here)}`;
  hardNavigate(`/login${next}`);
}

function handleGlobalError(error: unknown) {
  if (!(error instanceof ApiError)) return;

  // The session ended while someone was using the console.
  if (error.status === 401) redirectToLogin();

  // Signed in, but with a temporary password that has to be replaced first.
  if (error.status === 403 && error.code === "PASSWORD_CHANGE_REQUIRED") {
    if (typeof window !== "undefined" && window.location.pathname !== "/change-password") {
      hardNavigate("/change-password");
    }
  }
}

export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // useMe() handles its own 401, because "not signed in" is a normal answer there.
        if (query.queryKey[0] === "auth" && query.queryKey[1] === "me") return;
        handleGlobalError(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // A wrong password at sign-in is a 401 the form shows itself.
        if (mutation.options.mutationKey?.[0] === "login") return;
        handleGlobalError(error);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) => {
          // Retrying a 4xx never helps. Retry a flaky network or 5xx twice.
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}
