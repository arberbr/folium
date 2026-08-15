import { clerkMiddleware } from "@clerk/nextjs/server";

// Session handshake only. Auth checks live on the pages, Server Functions,
// and API routes that need them — middleware path matching can diverge from
// how Next.js routes requests. Public: /, /sign-in, /sign-up, /shared,
// /paper, /explore, /docs. Signed-in pages and /api/papers/* call
// auth.protect() so an anonymous visitor cannot spend another reader's
// OpenRouter credits.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
