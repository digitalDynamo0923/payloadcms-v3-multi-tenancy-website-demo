import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import TenantProvider from './Tenant'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <TenantProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </TenantProvider>
    </ThemeProvider>
  )
}
