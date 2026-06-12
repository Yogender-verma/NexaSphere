import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Matcher to protect workspace routes (e.g., /w/:workspaceId/...)
export const config = {
  matcher: ['/w/:workspaceId*/:path*', '/api/w/:workspaceId*/:path*'],
};

const JWKS_URI = process.env.JWKS_URI || `${process.env.NEXTAUTH_URL || ''}/.well-known/jwks.json`;
const EXPECTED_ISSUER = process.env.JWT_ISSUER || process.env.NEXTAUTH_URL || '';
const EXPECTED_AUDIENCE = process.env.JWT_AUDIENCE || 'nexasphere';

let jwksClient: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwksClient && JWKS_URI) {
    const url = new URL(JWKS_URI);
    jwksClient = createRemoteJWKSet(url);
  }
  return jwksClient;
}

/**
 * Next.js Middleware to enforce Multi-Tenant isolation and verify tenant-scoped access.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract workspace/tenant ID from the route path:
  // e.g. path starts with "/w/[workspaceId]" or "/api/w/[workspaceId]"
  const pathParts = pathname.split('/');

  // Find index of 'w' to determine the next parameter as workspaceId
  const wIndex = pathParts.findIndex((part) => part === 'w');

  if (wIndex === -1 || wIndex + 1 >= pathParts.length) {
    return NextResponse.next();
  }

  const workspaceId = pathParts[wIndex + 1];

  // Retrieve user session / JWT cookie (standard auth tokens)
  const token =
    request.cookies.get('session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!token) {
    // Redirect to login if this is a web route, or return 401 if it's an API route
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required. No session found.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 1. Verify session token cryptographically
    const decodedSession = await verifyJwt(token);

    if (!decodedSession || !decodedSession.userId) {
      throw new Error('Invalid session token payload');
    }

    const userId = decodedSession.userId;

    // 2. Verify user tenant access
    // Under Edge runtime, standard Prisma direct connections may fail,
    // so we can perform an edge-compatible DB check or call an internal service/API.
    // For demonstration of the middleware's logic:
    const hasAccess = await fetchTenantAccess(userId, workspaceId, request.nextUrl.origin);

    if (!hasAccess) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Forbidden. You do not have access to this workspace.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Attach workspace ID and User ID to headers for downstream requests
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-workspace-id', workspaceId);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-user-role', decodedSession.role || 'MEMBER');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('[Middleware] Authentication error:', error);

    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }
}

/**
 * Cryptographically verify a JWT using the configured JWKS endpoint.
 * Rejects tokens with alg:none, expired tokens, and invalid claims.
 */
async function verifyJwt(token: string): Promise<Record<string, unknown> | null> {
  try {
    const client = getJWKS();
    if (!client) {
      throw new Error('JWKS client not configured — set JWKS_URI or NEXTAUTH_URL');
    }

    const { payload } = await jwtVerify(token, client, {
      issuer: EXPECTED_ISSUER || undefined,
      audience: EXPECTED_AUDIENCE || undefined,
    });

    return payload as Record<string, unknown>;
  } catch (err) {
    console.error('[Middleware] JWT verification failed:', err);
    return null;
  }
}

/**
 * Validates tenant access via a secure internal endpoint or mock validation
 */
async function fetchTenantAccess(
  userId: string,
  workspaceId: string,
  origin: string
): Promise<boolean> {
  // During local development/testing, we can fall back to true or make an internal fetch
  try {
    const res = await fetch(
      `${origin}/api/auth/verify-tenant?userId=${userId}&workspaceId=${workspaceId}`,
      {
        headers: {
          'x-internal-secret': process.env.INTERNAL_AUTH_SECRET || 'fallback-secret',
        },
      }
    );

    if (!res.ok) return false;
    const data = await res.json();
    return !!data.hasAccess;
  } catch (err) {
    console.error(
      '[Middleware] Failed to verify tenant access via internal API. Denying access:',
      err
    );
    return false;
  }
}
