import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'minio.bitflix.com.br' },
      { protocol: 'https', hostname: 'minio.cms.bitflix.com.br' },
      { protocol: 'https', hostname: 'staging.minio.bitflix.com.br' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
}

export default withPayload(nextConfig)
