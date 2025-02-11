import React from 'react'
import { TenantSelector } from './index.client'
import { cookies as getCookies } from 'next/headers'
import { ServerComponentProps } from 'payload'
import { Tenant } from '@/payload-types'

const TenantSelectorRSC = async ({ user, payload }: ServerComponentProps) => {
  let tenants: Tenant[] = user.tenants || []

  if (user.roles.includes('super-admin')) {
    tenants = (
      await payload.find({
        collection: 'tenants',
        limit: 250,
      })
    ).docs
  }

  if (tenants.length === 0) return null

  const cookies = await getCookies()
  const tenantFromCookie = cookies.get('payload-tenant')?.value

  const selectedTenant = tenantFromCookie || tenants[0]!.id

  return <TenantSelector selectedTenant={selectedTenant} tenants={tenants} />
}

export default TenantSelectorRSC
