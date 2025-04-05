import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle not-found routes
  if (request.nextUrl.pathname === '/_not-found') {
    return NextResponse.redirect(new URL('/404', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/_not-found'],
}; 