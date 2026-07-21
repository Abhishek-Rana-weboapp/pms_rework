import { cn } from '@/shared/lib/utils'
import React from 'react'

const SectionWrapper = ({children, className, ...props}) => {
  return (
    <div className={cn("bg-white rounded-md shadow p-4", className)} {...props}>
       {children}
    </div>
  )
}

export default SectionWrapper
