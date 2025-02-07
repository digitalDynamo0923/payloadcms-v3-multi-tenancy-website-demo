import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, Where, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode, headers as getHeaders } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { redirect } from 'next/navigation'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    tenant: string
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const { isEnabled: draft } = await draftMode()
  const { tenant, slug = ['home'] } = await paramsPromise
  const url = '/' + slug.join('/')

  let page: RequiredDataFromCollectionSlug<'pages'> | null

  const tenantsQuery = await payload.find({
    collection: 'tenants',
    user,
    overrideAccess: false,
    where: {
      slug: {
        equals: tenant,
      },
    },
  })

  // If no tenant is found, the user does not have access
  // Show the login view
  if (tenantsQuery.docs.length === 0) {
    redirect(
      `/${tenant}/login?redirect=${encodeURIComponent(
        `/${tenant}${slug ? `/${slug.join('/')}` : ''}`,
      )}`,
    )
  }

  const slugConstraint: Where = slug
    ? {
        slug: {
          equals: slug.join('/'),
        },
      }
    : {
        or: [
          {
            slug: {
              equals: '',
            },
          },
          {
            slug: {
              equals: 'home',
            },
          },
          {
            slug: {
              exists: false,
            },
          },
        ],
      }

  page = await queryPageBySlug({
    where: {
      and: [
        {
          'tenant.slug': {
            equals: tenant,
          },
        },
        slugConstraint,
      ],
    },
  })

  // Remove this code once your website is seeded
  if (!page && slug.join('/') === 'home') {
    page = homeStatic(tenantsQuery.docs[0]!)
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { tenant, slug = ['home'] } = await paramsPromise

  const slugConstraint: Where = slug
    ? {
        slug: {
          equals: slug.join('/'),
        },
      }
    : {
        or: [
          {
            slug: {
              equals: '',
            },
          },
          {
            slug: {
              equals: 'home',
            },
          },
          {
            slug: {
              exists: false,
            },
          },
        ],
      }

  const page = await queryPageBySlug({
    where: {
      and: [
        {
          'tenant.slug': {
            equals: tenant,
          },
        },
        slugConstraint,
      ],
    },
  })

  return generateMeta({ doc: page })
}

const queryPageBySlug = cache(async ({ where }: { where: Where }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: where,
  })

  return result.docs?.[0] || null
})
