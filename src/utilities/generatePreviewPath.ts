import { Tenant } from '@/payload-types'
import { CollectionSlug, PayloadRequest } from 'payload'
import { cookies as getCookies } from 'next/headers'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = async ({ collection, slug, req }: Props) => {
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `${collectionPrefixMap[collection]}/${slug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const { payload } = req

  const cookies = await getCookies()
  const selectedTenant = cookies.get('payload-tenant')?.value

  let tenant: Tenant | null = null
  if (selectedTenant) {
    tenant = await payload.findByID({
      collection: 'tenants',
      id: selectedTenant,
    })
  }
  const isProduction =
    process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_PROJECT_PRODUCTION_URL)

  const protocol = isProduction ? 'https:' : req.protocol

  const url = `${protocol}//${req.host}/${tenant ? `${tenant.slug}/` : ''}next/preview?${encodedParams.toString()}`

  return url
}
