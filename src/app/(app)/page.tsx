import { HomeRedirect } from "@/features/shell/home-redirect";

// Everything here depends on the signed-in user, which the browser learns from /auth/me.
// There is no server-rendered content to make instant, so Next shouldn't validate it as such.
export const instant = false;

export default function Home() {
  return <HomeRedirect />;
}
