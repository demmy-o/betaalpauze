import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { BETA_COOKIE, heeftToegang, isAfgeschermd, nietIndexeren } from "@/lib/beta"

// 1. De bètaversie afschermen: zonder geldige cookie stuurt de middleware je naar /beta (lib/beta.ts).
// 2. Bij elk verzoek de inlogsessie van Supabase verversen, zodat je ingelogd blijft.
// 3. Pagina's van de bètaversie krijgen "noindex", zodat Google ze niet toont.
export async function middleware(request: NextRequest) {
  const pad = request.nextUrl.pathname

  if (isAfgeschermd(pad) && !(await heeftToegang(request.cookies.get(BETA_COOKIE)?.value))) {
    if (pad.startsWith("/api/")) {
      return NextResponse.json({ fout: "Alleen voor testers." }, { status: 401 })
    }
    const naar = new URL("/beta", request.url)
    naar.searchParams.set("terug", pad + request.nextUrl.search)
    return NextResponse.redirect(naar)
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  if (nietIndexeren(pad)) response.headers.set("X-Robots-Tag", "noindex, nofollow")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
