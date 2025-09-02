import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  console.log("MIDDLEWARE TOKEN:", token)

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  // Protect dashboard routes (both admin and staff can access)
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
