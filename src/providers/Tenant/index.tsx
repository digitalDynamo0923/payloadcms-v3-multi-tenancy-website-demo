'use client'

import { usePathname } from 'next/navigation'
import React, { createContext, useContext, useEffect, useState } from 'react'

type ContextType = { tenant: string }
const Context = createContext<ContextType>({} as ContextType)

export default function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantSlug, setTenantSlug] = useState('')
  const pathname = usePathname()

  console.log(pathname)
  useEffect(() => {
    const slug = pathname.split('/')[1]
    setTenantSlug(slug || '')
  }, [])

  return <Context.Provider value={{ tenant: tenantSlug }}>{children}</Context.Provider>
}

export function useTenant() {
  return useContext(Context)
}
