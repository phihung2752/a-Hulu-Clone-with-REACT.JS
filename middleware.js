 import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Increase clock skew tolerance
  clockSkewInSeconds: 300, // 5 minutes tolerance
  
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/landing",
    "/api/chat",  // Make chat API completely public
    "/api/movies",
    "/api/trending",
    "/api/search",
    "/api/movie/(.*)",
    "/static/(.*)",
    "/favicon.ico",
  ],
  
  // Routes to ignore authentication check
  ignoredRoutes: [
    "/api/chat",  // Completely bypass auth for chat
    "/api/webhook",
    "/_next/static/(.*)",
    "/images/(.*)",
  ],
});

// Stop Middleware running on static files and api routes
export const config = {
  matcher: [
    "/((?!api/chat|_next/static|_next/image|favicon.ico).*)",
  ],
};
