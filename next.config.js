/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  output: 'standalone',
  productionBrowserSourceMaps: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    },
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      'recharts',
      'lucide-react',
      '@iconify/react'
    ]
  },
  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/id/apps/academy/dashboard'
      },
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

module.exports = nextConfig
