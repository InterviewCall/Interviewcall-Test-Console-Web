"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { homeFor, useSessionUser } from "./session";

/** There is no dashboard yet, so "/" sends each role to the first page it can use. */
export function HomeRedirect() {
  const router = useRouter();
  const user = useSessionUser();

  useEffect(() => {
    router.replace(homeFor(user.role));
  }, [router, user.role]);

  return <Skeleton className="h-8 w-56" />;
}
