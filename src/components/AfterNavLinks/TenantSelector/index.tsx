import React from 'react'
import { TenantSelector } from './index.client'
import { cookies as getCookies } from 'next/headers'

const TenantSelectorRSC = async () => {
  const cookies = await getCookies()
  return <TenantSelector initialCookie={cookies.get('payload-tenant')?.value} />
}

export default TenantSelectorRSC
