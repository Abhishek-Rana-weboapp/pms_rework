import { Spinner } from '@/shared/components/ui/spinner'
import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

const OrgLayout = () => {
  return (
    <Suspense fallback={<Spinner />}>
       <Outlet />
    </Suspense>
  )
}

export default OrgLayout
