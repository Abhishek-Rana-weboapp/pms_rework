import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import SectionWrapper from '@/shared/components/wrappers/SectionWrapper'
import { createFullName, createInitials } from '@/shared/lib/helpers'
import React from 'react'

const DashboardTopPerformersSection = ({topPerformers}) => {
  return (
    <SectionWrapper>
        <h3 className='font-semibold mb-4'>Top Performers</h3>

        <div className='flex flex-col gap-3'>
             {
                topPerformers?.map((performer, index)=>{
                  return <div key={index} className='flex justify-between items-center'>

                    <div className='flex items-center gap-3'>
                         <Avatar>
                             <AvatarImage src={performer.user_image} alt={createFullName(performer)} />
                             <AvatarFallback>{createInitials(performer)}</AvatarFallback>
                         </Avatar>
                       <div>
                            <p className='text-sm'>{createFullName(performer)}</p>
                            <p className='text-xs text-gray-500'>{performer.role}</p>
                       </div>
                    </div>

                      <div>
                          <p className='text-sm font-medium'>{performer.tasks}</p>
                          <p className='text-xs text-gray-500'>TASKS</p>
                      </div>
                    </div>
                })
             }
        </div>
    </SectionWrapper>
  )
}

export default DashboardTopPerformersSection
