import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Landing, Explore, Docs, paper pages, and shared collections are public.
// Note this deliberately does not cover /api/* — the AI routes stay behind
// auth.protect() so an anonymous visitor cannot spend another reader's OpenRouter credits.
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/shared(.*)",
  "/paper(.*)",
  "/explore(.*)",
  "/docs(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
