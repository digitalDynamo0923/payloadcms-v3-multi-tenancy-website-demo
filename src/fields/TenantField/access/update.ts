import type { FieldAccess } from 'payload'
import { isSuperAdmin } from '../../../access/isSuperAdmin'
import { getTenantAccessIDs } from '../../../utilities/getTenantAccessIDs'

export const tenantFieldUpdate: FieldAccess = async (args) => {
  const tenantIDs = await getTenantAccessIDs(args.req.user)
  return Boolean(isSuperAdmin(args) || tenantIDs.length > 0)
}
