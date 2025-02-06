import React from 'react'

import { Login } from '../../../components/Login/client.page'

type Props = {
  params: Promise<{
    tenant: string
  }>
}

export default async function Page({ params }: Props) {
  const { tenant } = await params
  return <Login tenantSlug={tenant} />
}
