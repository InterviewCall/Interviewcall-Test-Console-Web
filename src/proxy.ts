import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match SESSION_COOKIE_NAME on the API.
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? "ic_staff_session";

/**
 * A fast, optimistic gate: no session cookie means no point rendering the console.
 * It only checks the cookie exists. The API still validates it on every request, and
 * the client checks /auth/me, so a stale cookie ends up on the login page as well.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const target = request.nextUrl.clone();
  const wanted = request.nextUrl.pathname + request.nextUrl.search;
  target.pathname = "/login";
  target.search = "";
  if (wanted !== "/") target.searchParams.set("next", wanted);
  return NextResponse.redirect(target);
}

export const config = {
  // Everything except the API, Next internals, files in /public (the logo has to load on the login
  // page, before anyone has a session) and the login page itself.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/|login).*)"],
};
