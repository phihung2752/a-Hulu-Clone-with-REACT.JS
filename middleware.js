import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Using clockSkewInMs instead of deprecated clockSkewInSeconds
  clockSkewInMs: 600000, // 10 minutes tolerance
  
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

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
