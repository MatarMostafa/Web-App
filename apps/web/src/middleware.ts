import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Role-based route protection
    if (pathname.startsWith("/dashboard-admin")) {
      if (token?.role !== "ADMIN") {
        if (token?.role === "TEAM_LEADER") {
          return NextResponse.redirect(new URL("/dashboard-team-leader", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard-employee", req.url));
      }
    }

    if (pathname.startsWith("/dashboard-team-leader")) {
      if (token?.role !== "TEAM_LEADER") {
        if (token?.role === "ADMIN") {
          return NextResponse.redirect(new URL("/dashboard-admin", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard-employee", req.url));
      }
    }

    if (pathname.startsWith("/dashboard-employee")) {
      if (token?.role !== "EMPLOYEE" && token?.role !== "ADMIN") {
        if (token?.role === "TEAM_LEADER") {
          return NextResponse.redirect(new URL("/dashboard-team-leader", req.url));
        }
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard-admin/:path*", "/dashboard-employee/:path*", "/dashboard-team-leader/:path*"],
};
