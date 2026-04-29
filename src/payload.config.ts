import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles.ts'
import { ArticleImportsLog } from './collections/ArticleImportsLog.ts'
import { Authors } from './collections/Authors.ts'
import { Categories } from './collections/Categories.ts'
import { Media } from './collections/Media.ts'
import { Products } from './collections/Products.ts'
import { Tags } from './collections/Tags.ts'
import { Users } from './collections/Users.ts'

import { Navigation } from './globals/Navigation.ts'
import { SiteSettings } from './globals/SiteSettings.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · Bitflix admin',
    },
  },
  collections: [
    Users,
    Authors,
    Articles,
    Categories,
    Tags,
    Products,
    Media,
    ArticleImportsLog,
  ],
  globals: [SiteSettings, Navigation],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || 'bitflix-lp-staging-media',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
        forcePathStyle: true,
      },
    }),
  ],
})
