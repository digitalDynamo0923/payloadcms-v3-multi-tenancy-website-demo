'use client'
import React from 'react'

import { useAuth, RelationshipField } from '@payloadcms/ui'
import { User } from '@/payload-types'
import { RelationshipFieldClientComponent } from 'payload'

const TenantFieldComponent: RelationshipFieldClientComponent = ({ path, readOnly, field }) => {
  const { user } = useAuth<User>()

  if (user) {
    if ((user.tenants && user.tenants.length > 1) || user?.roles?.includes('super-admin')) {
      return <RelationshipField field={field} path={path} readOnly={readOnly} />
    }
  }
  return null
}

export default TenantFieldComponent
