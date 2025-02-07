import type { User } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const getTenantAccessIDs = async (user: User | null): Promise<string[]> => {
  if (!user) return []
  if (user.roles?.includes('super-admin')) {
    const payload = await getPayload({ config: configPromise })
    const tenantsData = await payload.find({
      collection: 'tenants',
      limit: 250,
    })
    return tenantsData.docs.map((doc) => doc.id)
  }
  return (
    user?.tenants?.reduce((acc: string[], { tenant }) => {
      if (tenant) {
        acc.push(typeof tenant === 'string' ? tenant : tenant.id)
      }
      return acc
    }, []) || []
  )
}
