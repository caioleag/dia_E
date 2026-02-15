import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ["/login", "/auth/callback"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow sala entry route for non-authenticated (will redirect to login preserving code)
  const isSalaEntryRoute = /^\/sala\/[^/]+$/.test(pathname);

  if (!user && !isPublicRoute && !isSalaEntryRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    // Check onboarding completion for authenticated users
    const { data: userData } = await supabase
      .from("users")
      .select("onboarding_completo")
      .eq("id", user.id)
      .single();

    const needsOnboarding = userData && !userData.onboarding_completo;
    const isOnboardingRoute = pathname.startsWith("/onboarding");
    const isAuthRoute =
      pathname.startsWith("/auth") || pathname.startsWith("/login");

    if (needsOnboarding && !isOnboardingRoute && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
