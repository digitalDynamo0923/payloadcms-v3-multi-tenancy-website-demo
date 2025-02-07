import { headersWithCors } from 'payload'
import { APIError, Collection, Endpoint, generatePayloadCookie } from 'payload'

// A custom endpoint that can be reached by POST request
// at: /api/users/external-users/login
export const externalUsersLogin: Endpoint = {
  path: '/external-users/login',
  method: 'post',
  handler: async (req) => {
    let data: { [key: string]: string } = {}

    try {
      if (typeof req.json === 'function') {
        data = await req.json()
      }
    } catch (error) {}
    const { username, password, tenantSlug } = data

    if (!username || !password) {
      throw new APIError('Username and Password are required for login.', 400, null, true)
    }

    const fullTenant = (
      await req.payload.find({
        collection: 'tenants',
        where: {
          slug: {
            equals: tenantSlug,
          },
        },
      })
    ).docs[0]

    if (!fullTenant) throw new APIError('Tenant is missing', 400, null, true)

    const foundUser = await req.payload.find({
      collection: 'users',
      where: {
        or: [
          {
            and: [
              {
                email: {
                  equals: username,
                },
              },
              {
                'tenants.tenant': {
                  equals: fullTenant.id,
                },
              },
            ],
          },
          {
            and: [
              {
                username: {
                  equals: username,
                },
              },
              {
                'tenants.tenant': {
                  equals: fullTenant.id,
                },
              },
            ],
          },
        ],
      },
    })

    if (foundUser.totalDocs > 0) {
      try {
        const loginAttempt = await req.payload.login({
          collection: 'users',
          data: {
            email: foundUser.docs[0]!.email,
            password,
          },
          req,
        })

        if (loginAttempt?.token) {
          const collection: Collection = req.payload.collections['users']
          const cookie = generatePayloadCookie({
            collectionAuthConfig: collection.config.auth,
            cookiePrefix: 'payload',
            token: loginAttempt.token,
          })

          return Response.json(loginAttempt, {
            headers: headersWithCors({
              headers: new Headers({
                'Set-Cookie': cookie,
              }),
              req,
            }),
            status: 200,
          })
        }

        throw new APIError(
          'Unable to login with the provided username and password.',
          400,
          null,
          true,
        )
      } catch (e) {
        throw new APIError(
          'Unable to login with the provided username and password.',
          400,
          null,
          true,
        )
      }
    }

    throw new APIError('Unable to login with the provided username and password.', 400, null, true)
  },
}
