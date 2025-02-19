import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer } from '@/payload-types'

import { FooterClient } from './Component.client'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  return <FooterClient footerData={footerData} />
}
