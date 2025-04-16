// File: middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected (requires authentication)
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/settings');
  
  // Check if path is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Check if path is auth related
  const isAuthRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password');
  
  // Get the NextAuth session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Redirect logic
  if (isProtectedRoute) {
    // If not authenticated, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // If admin route but user is not admin, redirect to dashboard
    if (isAdminRoute && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (isAuthRoute && token) {
    // If already logged in and trying to access auth pages, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/settings/:path*',
    // Auth routes
    '/login',
    '/register',
    '/forgot-password',
  ],
};