import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('Middleware: Request received for path:', req.nextUrl.pathname);
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  console.log('Middleware: Attempting to get session...');
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Middleware: Session data:', session);

  const publicPaths = ['/login', '/register'];

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  console.log('Middleware: Is public path?', isPublicPath);

  // If the user is NOT logged in AND is trying to access a non-public path
  if (!session && !isPublicPath) {
    // Redirect to login page
    console.log('Middleware: User not logged in and path is not public. Redirecting to /login.');
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user IS logged in AND is trying to access a public path (optional: redirect logged in users from login/register)
  // This part is optional, uncomment if you want to redirect logged-in users away from login/register pages
  // if (session && isPublicPath) {
  //   const homeUrl = new URL('/', req.url);
  //   return NextResponse.redirect(homeUrl);
  // }

  // Otherwise, continue to the requested path
  console.log('Middleware: Allowing request to proceed.');
  return res;
}

// Specify the paths that the middleware should run on
export const config = {
  matcher: ['/'], // Only match the root path
}; 