import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../../access/isSuperAdmin'
import { isSuperAdminOrSelf } from './access/isSuperAdminOrSelf'
import { externalUsersLogin } from './endpoints/externalUsersLogin'
import { ensureUniqueUsername } from './hooks/ensureUniqueUsername'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['username', 'email'],
    useAsTitle: 'username',
  },
  access: {
    create: isSuperAdmin,
    read: (args) => {
      const { req } = args
      if (!req?.user) return false

      if (isSuperAdmin(args)) return true

      return {
        id: {
          equals: req.user.id,
        },
      }
    },
    update: isSuperAdminOrSelf,
    delete: isSuperAdmin,
  },
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['user'],
      options: ['super-admin', 'user'],
    },
    {
      name: 'tenants',
      type: 'array',
      access: {
        create: ({ req }) => {
          if (isSuperAdmin({ req })) return true
          return false
        },
        update: ({ req }) => {
          if (isSuperAdmin({ req })) return true
          return false
        },
      },
      fields: [
        {
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          index: true,
          saveToJWT: true,
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          defaultValue: ['viewer'],
          options: ['super-admin', 'viewer'],
        },
      ],
    },
    {
      name: 'username',
      type: 'text',
      index: true,
      hooks: {
        beforeValidate: [ensureUniqueUsername],
      },
    },
  ],
  endpoints: [externalUsersLogin],
  timestamps: true,
}
