import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before rendering. Two jobs, nothing heavy:
 *  1. Cloud mode: refresh the Supabase auth cookies so SSR sees a live session.
 *  2. Redirect obviously-signed-out visitors away from app pages to /welcome.
 * The real auth + onboarding gate lives in app/(app)/layout.tsx (a server
 * component that queries the DB). API routes are excluded by the matcher and
 * return 401 JSON themselves — proxy never redirects them.
 */
const APP_PREFIXES = ["/thread", "/timeline", "/memory", "/pause", "/settings"];

function hasSessionCookie(req: NextRequest): boolean {
  // Local adapter cookie, or any Supabase auth cookie (sb-...-auth-token).
  if (req.cookies.get("pip_session")) return true;
  for (const c of req.cookies.getAll()) if (c.name.startsWith("sb-") && c.name.includes("auth-token")) return true;
  return false;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const mode = process.env.APP_MODE ?? (process.env.VERCEL_ENV ? "cloud" : "local");
  let res = NextResponse.next();

  if (mode === "cloud") {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && anon) {
        const supabase = createServerClient(url, anon, {
          cookies: {
            getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
            setAll: (list) => {
              for (const { name, value, options } of list) res.cookies.set(name, value, options);
            },
          },
        });
        await supabase.auth.getUser();
      }
    } catch {
      res = NextResponse.next();
    }
  }

  const path = req.nextUrl.pathname;
  const isApp = APP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  if (isApp && !hasSessionCookie(req)) {
    const to = req.nextUrl.clone();
    to.pathname = "/welcome";
    return NextResponse.redirect(to);
  }
  return res;
}

export const config = {
  matcher: [
    // Everything EXCEPT: api routes, the SW/manifest, public help/offline, assets.
    "/((?!api/|_next/|sw.js|manifest.webmanifest|offline|help|goodbye|icons/|fonts/|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$).*)",
  ],
};
