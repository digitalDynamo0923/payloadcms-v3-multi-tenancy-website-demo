import type { FieldHook } from 'payload'
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const autofillTenant: FieldHook = async ({ req, value }) => {
  // If there is no value,
  // and the user only has one tenant,
  // return that tenant ID as the value
  if (!value) {
    const tenantIDs = await getTenantAccessIDs(req.user)
    console.log(tenantIDs)
    if (tenantIDs.length === 1) return tenantIDs[0]
  }

  return value
}
