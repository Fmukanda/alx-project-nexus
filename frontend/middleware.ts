import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that require authentication
const protectedRoutes = [
  '/profile',
  '/orders',
  '/wishlist',
  '/checkout',
  '/admin',
];

// Define routes that require admin privileges
const adminRoutes = [
  '/admin',
  '/admin/products',
  '/admin/orders',
  '/admin/customers',
  '/admin/analytics',
  '/admin/settings',
];

// Define public routes that should redirect to home if user is authenticated
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
];

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/auth/me',
  '/api/orders',
  '/api/profile',
  '/api/cart',
  '/api/wishlist',
  '/api/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const userData = request.cookies.get('user_data')?.value;

  let user = null;
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
    }
  }

  const isAuthenticated = !!accessToken;
  const isAdmin = user?.isStaff || user?.isSuperuser;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return handleApiRoutes(request, pathname, isAuthenticated, isAdmin);
  }

  // Handle public routes (redirect to home if authenticated)
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Handle admin routes
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      url.pathname = '/auth/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (!isAdmin) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      url.pathname = '/auth/login';
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

function handleApiRoutes(
  request: NextRequest,
  pathname: string,
  isAuthenticated: boolean,
  isAdmin: boolean
) {
  const response = NextResponse.next();

  // Add CORS headers for API routes
  response.headers.set('Access-Control-Allow-Origin', 
    process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:3000'
  );
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: response.headers,
    });
  }

  // Check if the API route requires authentication
  if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          code: 'UNAUTHENTICATED'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers),
          },
        }
      );
    }

    // Check if the API route requires admin privileges
    if (pathname.startsWith('/api/admin') && !isAdmin) {
      return new Response(
        JSON.stringify({ 
          error: 'Admin privileges required',
          code: 'FORBIDDEN'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers),
          },
        }
      );
    }
  }

  return response;
}

// Configure which routes the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (public auth endpoints)
     * - api/products (public product endpoints)
     * - api/categories (public category endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/api/:path*',
  ],
};

// Helper function to refresh access token
async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    return {
      accessToken: data.access,
      expiresIn: data.expires_in || 3600, // Default to 1 hour
    };
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Extended middleware with token refresh functionality (optional advanced version)
export async function advancedMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const userData = request.cookies.get('user_data')?.value;

  let user = null;
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
    }
  }

  const isAuthenticated = !!accessToken;
  const isAdmin = user?.isStaff || user?.isSuperuser;

  // Handle token refresh for authenticated API calls
  if (isAuthenticated && refreshToken && pathname.startsWith('/api/') && !pathname.includes('/auth/')) {
    try {
      // You could add logic here to check token expiration and refresh if needed
      // This is a more advanced implementation that would require tracking token expiration
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }

  // Rest of the middleware logic remains the same as above...
  // For brevity, I'm including the main logic here but you would merge the two functions

  return middleware(request);
}