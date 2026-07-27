import React from 'react'
import { Spinner } from '../ui/spinner'

const PageLoader = () => {
  return (
    <div className='flex justify-center items-center w-full h-full'>
       <Spinner />
    </div>
  )
}

export default PageLoader
