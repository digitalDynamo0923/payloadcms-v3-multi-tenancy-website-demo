import type { Media, Tenant } from '@/payload-types'

export const imageHero1 = (tenant: Tenant): Omit<Media, 'createdAt' | 'id' | 'updatedAt'> => ({
  alt: 'Straight metallic shapes with a blue gradient',
  tenant,
})
