import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  console.log("MIDDLEWARE TOKEN:", token)

  // If user is authenticated and tries to access signin, redirect to dashboard
  if (pathname.startsWith("/auth/signin") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      console.log("Redirecting to signin from admin route")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  // Root ("/") → redirect based on auth state
  if (pathname === "/") {
    if (!token) {
      console.log("Redirecting to signin from root")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Protect dashboard routes (both admin and staff can access)
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("Redirecting to signin from dashboard route")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  console.log("Allowing access to:", pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/",
    "/auth/signin", // ✅ now included to handle redirect if logged in
  ],
}
