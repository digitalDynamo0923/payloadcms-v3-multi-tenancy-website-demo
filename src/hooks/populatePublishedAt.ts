import { getTenantAccessIDs } from '@/utilities/getTenantAccessIDs'
import type { CollectionBeforeChangeHook } from 'payload'

export const populatePublishedAt: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  let result = { ...data }

  if (operation === 'create' || operation === 'update') {
    if (req.data && !req.data.publishedAt) {
      const now = new Date()
      result = {
        ...result,
        publishedAt: now,
      }
    }
  }

  if (!result.tenant) {
    const tenantIDs = await getTenantAccessIDs(req.user)
    result = {
      ...result,
      tenant: tenantIDs[0],
    }
  }

  return result
}
