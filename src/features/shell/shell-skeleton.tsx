import { Skeleton } from "@/components/ui/skeleton";

export function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh" role="status" aria-label="Loading the console">
      <div className="hidden w-64 shrink-0 flex-col gap-3 bg-rail p-5 lg:flex">
        <Skeleton className="h-9 w-40 !bg-rail-line !bg-none" />
        <Skeleton className="mt-6 h-9 w-full !bg-rail-line !bg-none" />
        <Skeleton className="h-9 w-full !bg-rail-line !bg-none" />
      </div>
      <div className="flex-1 p-6 lg:p-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <Skeleton className="mt-8 h-64 w-full rounded-panel" />
      </div>
    </div>
  );
}
