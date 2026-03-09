import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "shiftly_session";

async function verify(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "shiftly-dev-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId?: string; role?: "SEEKER" | "EMPLOYER" };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verify(token) : null;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/register");
  const isEmployerPath = path.startsWith("/employer");
  const isSeekerPath = path.startsWith("/seeker");

  if ((isEmployerPath || isSeekerPath) && !payload?.userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isEmployerPath && payload?.role !== "EMPLOYER") {
    return NextResponse.redirect(new URL("/seeker/dashboard", req.url));
  }

  if (isSeekerPath && payload?.role !== "SEEKER") {
    return NextResponse.redirect(new URL("/employer/dashboard", req.url));
  }

  if (isAuthPage && payload?.userId) {
    const target = payload.role === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/employer/:path*", "/seeker/:path*"],
};
