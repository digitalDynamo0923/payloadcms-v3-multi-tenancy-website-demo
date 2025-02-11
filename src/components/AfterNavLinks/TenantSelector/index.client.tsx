'use client'

import React from 'react'
import { useAuth, SelectInput, useConfig } from '@payloadcms/ui'
import type { Tenant, User } from '../../../payload-types'

import './index.scss'
import { Option } from '@payloadcms/ui/elements/ReactSelect'
import { useParams } from 'next/navigation'

export const TenantSelector = ({
  selectedTenant,
  tenants,
}: {
  selectedTenant: string
  tenants: Tenant[]
}) => {
  const { user } = useAuth<User>()
  const [value] = React.useState<string>(selectedTenant)
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()
  const params = useParams()

  const isSuperAdmin = user?.roles?.includes('super-admin')

  function setCookie(name: string, value?: string) {
    const expires = '; expires=Fri, 31 Dec 9999 23:59:59 GMT'
    document.cookie = name + '=' + (value || '') + expires + '; path=/'
  }

  const handleChange = React.useCallback((option: Option | Option[]) => {
    let path = ''
    if (!params.segments) path = ''
    if (typeof params.segments === 'string') path = params.segments
    if (Array.isArray(params.segments)) path = params.segments.slice(0, 2).filter(Boolean).join('/')

    if (!option) {
      setCookie('payload-tenant', undefined)
      window.location.replace(`${adminRoute}/${path}`)
    } else if ('value' in option) {
      setCookie('payload-tenant', option.value as string)
      window.location.replace(`${adminRoute}/${path}`)
    }
  }, [])

  if (isSuperAdmin || tenants.length > 1) {
    return (
      <div className="tenant-selector">
        <SelectInput
          label="Select a tenant"
          name="setTenant"
          path="setTenant"
          options={tenants.map((tenant) => ({
            label: tenant.name,
            value: tenant.id,
          }))}
          onChange={handleChange}
          value={value}
          isClearable={false}
        />
      </div>
    )
  }

  return null
}
