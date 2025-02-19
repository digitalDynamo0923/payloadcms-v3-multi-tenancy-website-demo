import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { tenantField } from '@/fields/TenantField'
import { byTenant } from '@/access/byTenant'
import { isPayloadAdminPanel } from '@/utilities/isPayloadAdminPanel'
import { setTenantValue } from '@/hooks/setTenantValue'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    delete: (args) => byTenant({ ...args, hasDraft: false }),
    read: async (args) => {
      if (isPayloadAdminPanel(args.req)) return byTenant({ ...args, hasDraft: false })

      return true
    },
    update: (args) => byTenant({ ...args, hasDraft: false }),
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    ...slugField(),
    tenantField,
  ],
  hooks: {
    beforeOperation: [setTenantValue],
  },
}
