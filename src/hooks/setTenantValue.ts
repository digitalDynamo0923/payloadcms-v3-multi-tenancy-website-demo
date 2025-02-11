import { BeforeOperationHook } from 'node_modules/payload/dist/collections/config/types'

export const setTenantValue: BeforeOperationHook = ({ req, operation, collection }) => {
  const cookies = `; ${req.headers.get('cookie')}`
  const parts = cookies.split('; payload-tenant=')
  const tenantId = parts.pop()?.split(';')?.shift()

  if (req.data) {
    req.data.tenant = tenantId
  }
}
