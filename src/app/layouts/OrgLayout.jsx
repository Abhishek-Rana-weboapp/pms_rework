import PageLoader from '@/shared/components/layout/PageLoader'
import { Spinner } from '@/shared/components/ui/spinner'
import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

const OrgLayout = () => {
  return (
    <div className='h-dvh w-full'>
      <Suspense fallback={<PageLoader />}>
         <Outlet />
      </Suspense>
    </div>
  )
}

export default OrgLayout
