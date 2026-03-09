import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "shiftly_session";
type SessionRole = "SEEKER" | "EMPLOYER";
type SessionPayload = { userId: string; role: SessionRole };

async function verify(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "shiftly-dev-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    const userId = typeof payload.userId === "string" ? payload.userId : null;
    const role = payload.role === "SEEKER" || payload.role === "EMPLOYER" ? payload.role : null;
    return userId && role ? ({ userId, role } satisfies SessionPayload) : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verify(token) : null;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/register");
  const isEmployerPath = path.startsWith("/employer");
  const isSeekerPath = path.startsWith("/seeker");
  const isProtectedPath = isEmployerPath || isSeekerPath;

  if (token && !session) {
    const response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE);
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", req.url), { headers: response.headers });
    }
    return response;
  }

  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isEmployerPath && session && session.role !== "EMPLOYER") {
    return NextResponse.redirect(new URL("/seeker/dashboard", req.url));
  }

  if (isSeekerPath && session && session.role !== "SEEKER") {
    return NextResponse.redirect(new URL("/employer/dashboard", req.url));
  }

  if (isAuthPage && session) {
    const target = session.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/employer/:path*", "/seeker/:path*"],
};
