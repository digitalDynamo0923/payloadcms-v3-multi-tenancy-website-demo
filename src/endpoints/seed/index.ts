import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'forms',
  'form-submissions',
  'search',
  'tenants',
]
const globals: GlobalSlug[] = ['header', 'footer']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection].config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, req, where: {} })),
  )

  const superAdmin = await payload.find({
    collection: 'users',
    where: {
      roles: {
        contains: 'super-admin',
      },
    },
  })

  payload.logger.info(`Super Admin => ${superAdmin.docs[0]?.email}`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        not_equals: superAdmin.docs[0]?.email,
      },
    },
  })

  payload.logger.info(`- Seeding Tenants ...`)

  const tenant1 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 1',
      slug: 'tenant-1',
    },
  })

  const tenant2 = await payload.create({
    collection: 'tenants',
    data: {
      name: 'Tenant 2',
      slug: 'tenant-2',
    },
  })

  payload.logger.info('Tenants', tenant1.id, tenant2.id)

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  payload.logger.info(`— Seeding demo author and user...`)

  const [tenant1Admin, tenant2Admin, , , , , image1Doc, image2Doc, image3Doc, imageHomeDoc] =
    await Promise.all([
      payload.create({
        collection: 'users',
        data: {
          username: 'Tenant 1 Admin',
          email: 'tenant1.admin@example.com',
          password: 'password',
          roles: ['user'],
          tenants: [
            {
              tenant: tenant1,
              roles: ['super-admin'],
            },
          ],
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          username: 'Tenant 2 Admin',
          email: 'tenant2.admin@example.com',
          password: 'password',
          roles: ['user'],
          tenants: [
            {
              tenant: tenant2,
              roles: ['super-admin'],
            },
          ],
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          username: 'Tenant 1 User',
          email: 'tenant1.user@example.com',
          password: 'password',
          roles: ['user'],
          tenants: [
            {
              tenant: tenant1,
              roles: ['viewer'],
            },
          ],
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          username: 'Tenant 2 User',
          email: 'tenant2.user@example.com',
          password: 'password',
          roles: ['user'],
          tenants: [
            {
              tenant: tenant2,
              roles: ['viewer'],
            },
          ],
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          username: 'Double Admin',
          email: 'double.admin@example.com',
          password: 'password',
          roles: ['user'],
          tenants: [
            {
              tenant: tenant1,
              roles: ['super-admin'],
            },
            {
              tenant: tenant2,
              roles: ['super-admin'],
            },
          ],
        },
      }),
      payload.create({
        collection: 'users',
        data: {
          username: 'Double User',
          email: 'double.user@example.com',
          password: 'password',
          roles: ['user'],
          tenants: [
            {
              tenant: tenant1,
              roles: ['viewer'],
            },
            {
              tenant: tenant2,
              roles: ['viewer'],
            },
          ],
        },
      }),
      payload.create({
        collection: 'media',
        data: image1(tenant1),
        file: image1Buffer,
      }),
      payload.create({
        collection: 'media',
        data: image2(tenant1),
        file: image2Buffer,
      }),
      payload.create({
        collection: 'media',
        data: image2(tenant2),
        file: image3Buffer,
      }),
      payload.create({
        collection: 'media',
        data: imageHero1(tenant1),
        file: hero1Buffer,
      }),

      payload.create({
        collection: 'categories',
        data: {
          title: 'Technology',
          breadcrumbs: [
            {
              label: 'Technology',
              url: '/technology',
            },
          ],
          tenant: tenant1,
        },
      }),

      payload.create({
        collection: 'categories',
        data: {
          title: 'News',
          breadcrumbs: [
            {
              label: 'News',
              url: '/news',
            },
          ],
          tenant: tenant1,
        },
      }),

      payload.create({
        collection: 'categories',
        data: {
          title: 'Finance',
          breadcrumbs: [
            {
              label: 'Finance',
              url: '/finance',
            },
          ],
          tenant: tenant2,
        },
      }),
      payload.create({
        collection: 'categories',
        data: {
          title: 'Design',
          breadcrumbs: [
            {
              label: 'Design',
              url: '/design',
            },
          ],
          tenant: tenant2,
        },
      }),

      payload.create({
        collection: 'categories',
        data: {
          title: 'Software',
          breadcrumbs: [
            {
              label: 'Software',
              url: '/software',
            },
          ],
          tenant: tenant2,
        },
      }),

      payload.create({
        collection: 'categories',
        data: {
          title: 'Engineering',
          breadcrumbs: [
            {
              label: 'Engineering',
              url: '/engineering',
            },
          ],
          tenant: tenant1,
        },
      }),
    ])

  // let demoAuthorID: number | string = demoAuthor.id

  // let image1ID: number | string = image1Doc.id
  // let image2ID: number | string = image2Doc.id
  // let image3ID: number | string = image3Doc.id
  // let imageHomeID: number | string = imageHomeDoc.id

  // if (payload.db.defaultIDType === 'text') {
  //   image1ID = `"${image1Doc.id}"`
  //   image2ID = `"${image2Doc.id}"`
  //   image3ID = `"${image3Doc.id}"`
  //   imageHomeID = `"${imageHomeDoc.id}"`
  //   demoAuthorID = `"${demoAuthorID}"`
  // }

  payload.logger.info(`— Seeding posts...`)

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post1({
      heroImage: image1Doc,
      blockImage: image2Doc,
      author: tenant1Admin,
      tenant: tenant1,
    }),
  })

  console.log('Post 1: ', post1Doc.id)

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post2({
      heroImage: image2Doc,
      blockImage: image3Doc,
      author: tenant1Admin,
      tenant: tenant1,
    }),
  })

  console.log('Post 2: ', post2Doc.id)

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableRevalidate: true,
    },
    data: post3({
      heroImage: image3Doc,
      blockImage: image1Doc,
      author: tenant2Admin,
      tenant: tenant2,
    }),
  })

  console.log('Post 3: ', post3Doc.id)

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id],
    },
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData(tenant1),
  })

  // let contactFormID: number | string = contactForm.id

  // if (payload.db.defaultIDType === 'text') {
  //   contactFormID = `"${contactFormID}"`
  // }

  payload.logger.info(`— Seeding pages...`)

  const [, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc, tenant: tenant1 }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      data: contactPageData({ contactForm: contactForm, tenant: tenant2 }),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Posts',
              url: '/posts',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/admin',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/main/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
