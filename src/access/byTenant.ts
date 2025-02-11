import type { Access, AccessArgs, AccessResult, Where } from 'payload'
import { parseCookies } from 'payload'
import { isSuperAdmin } from './isSuperAdmin'
import { getTenantAccessIDs } from '../utilities/getTenantAccessIDs'

export const byTenant = async (args: AccessArgs & { hasDraft: boolean }): Promise<AccessResult> => {
  const { req, hasDraft } = args
  const cookies = parseCookies(req.headers)
  const superAdmin = isSuperAdmin(args)
  const selectedTenant = cookies.get('payload-tenant')

  const tenantAccessIDs = await getTenantAccessIDs(req.user)

  const draftWhere: Where = {
    and: [
      {
        tenant: {
          exists: false,
        },
        _status: {
          equals: 'draft',
        },
      },
    ],
  }

  // First check for manually selected tenant from cookies
  if (selectedTenant) {
    // If it's a super admin,
    // give them read access to only pages for that tenant
    if (superAdmin) {
      return hasDraft
        ? ({
            or: [
              {
                tenant: {
                  equals: selectedTenant,
                },
              },
              draftWhere,
            ],
          } as Where)
        : {
            tenant: {
              equals: selectedTenant,
            },
          }
    }

    const hasTenantAccess = tenantAccessIDs.some((id) => id === selectedTenant)

    // If NOT super admin,
    // give them access only if they have access to tenant ID set in cookie
    if (hasTenantAccess) {
      return hasDraft
        ? ({
            or: [
              {
                tenant: {
                  equals: selectedTenant,
                },
              },
              draftWhere,
            ],
          } as Where)
        : {
            tenant: {
              equals: selectedTenant,
            },
          }
    }
  }

  // If no manually selected tenant,
  // but it is a super admin, give access to all
  if (superAdmin) {
    return true
  }

  // If not super admin,
  // but has access to tenants,
  // give access to only their own tenants
  if (tenantAccessIDs.length) {
    return hasDraft
      ? ({
          or: [
            {
              tenant: {
                in: tenantAccessIDs,
              },
            },
            draftWhere,
          ],
        } as Where)
      : {
          tenant: {
            in: tenantAccessIDs,
          },
        }
  }

  // Deny access to all others
  return false
}
