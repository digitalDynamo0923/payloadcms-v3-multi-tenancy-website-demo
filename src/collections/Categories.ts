import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from '@/fields/slug'
import { tenantField } from '@/fields/TenantField'
import { byTenant } from '@/access/byTenant'
import { isPayloadAdminPanel } from '@/utilities/isPayloadAdminPanel'
import { externalReadAccess } from '@/access/externalReadAccess'
import { setTenantValue } from '@/hooks/setTenantValue'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    delete: (args) => byTenant({ ...args, hasDraft: false }),
    read: async (args) => {
      if (isPayloadAdminPanel(args.req)) return byTenant({ ...args, hasDraft: false })

      return externalReadAccess(args)
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
