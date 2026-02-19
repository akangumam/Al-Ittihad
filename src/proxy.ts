import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // List of paths that should be rewritten to /id/ prefix
  const publicPaths = ['/profil', '/akademik', '/alumni', '/ppdb', '/kontak', '/login', '/register', '/forgot-password']

  // Dashboard paths that should NOT be rewritten (no /id/ prefix)
  const dashboardPaths = [
    '/apps',
    '/cms',
    '/akademik-dashboard',
    '/keuangan',
    '/laporan',
    '/rab',
    '/spp',
    '/system',
    '/pengaturan',
    '/ppdb-management'
  ]

  // Check if pathname starts with any dashboard path
  const isDashboardPath = dashboardPaths.some(path => pathname.startsWith(path))

  // If it's dashboard path, don't rewrite - let it go to [lang] folder
  if (isDashboardPath) {
    const url = request.nextUrl.clone()

    url.pathname = `/id${pathname}`
    
return NextResponse.rewrite(url)
  }

  // Check if pathname starts with any public path
  const shouldRewrite = publicPaths.some(path => pathname.startsWith(path))

  // Rewrite public paths to include /id/ prefix internally
  if (shouldRewrite) {
    const url = request.nextUrl.clone()

    url.pathname = `/id${pathname}`

    return NextResponse.rewrite(url)
  }

  // Redirect root to /id
  if (pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - berita (already has public route)
     * - front-pages (demo pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|berita|front-pages).*)'
  ]
}
