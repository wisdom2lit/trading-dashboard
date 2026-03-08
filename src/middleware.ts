import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // For now, just allow all requests and let the client handle authentication
  // In production, you would use Supabase client to check session properly
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};
