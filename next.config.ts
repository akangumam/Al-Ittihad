import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  output: 'standalone', // For Docker deployment
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/id/apps/academy/dashboard'
      },

      // Explicit rewrites for all major root paths to avoid 404s
      {
        source: '/akademik/:path*',
        destination: '/id/akademik/:path*'
      },
      {
        source: '/apps/:path*',
        destination: '/id/apps/:path*'
      },
      {
        source: '/biaya/:path*',
        destination: '/id/biaya/:path*'
      },
      {
        source: '/keuangan/:path*',
        destination: '/id/keuangan/:path*'
      },
      {
        source: '/rab/:path*',
        destination: '/id/rab/:path*'
      },
      {
        source: '/laporan/:path*',
        destination: '/id/laporan/:path*'
      },
      {
        source: '/pengaturan/:path*',
        destination: '/id/pengaturan/:path*'
      },
      {
        source: '/system/:path*',
        destination: '/id/system/:path*'
      },
      {
        source: '/dashboards/:path*',
        destination: '/id/dashboards/:path*'
      },
      {
        source: '/login',
        destination: '/id/login'
      },
      {
        source: '/register',
        destination: '/id/register'
      },
      {
        source: '/forgot-password',
        destination: '/id/forgot-password'
      },
      {
        source: '/pembayaran/:path*',
        destination: '/id/pembayaran/:path*'
      },
      {
        source: '/tunggakan/:path*',
        destination: '/id/tunggakan/:path*'
      },
      {
        source: '/penetapan-nominal/:path*',
        destination: '/id/penetapan-nominal/:path*'
      },
      {
        source: '/spp/:path*',
        destination: '/id/spp/:path*'
      }
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/dashboards/crm',
        destination: '/',
        permanent: false
      }
    ]
  }
}

export default nextConfig
