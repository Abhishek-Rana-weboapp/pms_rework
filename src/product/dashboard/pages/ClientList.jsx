import React from 'react'
import { useClients } from '../api/queries';
import Wrapper from '@/shared/components/wrappers/Wrapper';

const ClientList = () => {
  const {data:clientsData} = useClients()
  console.log(clientsData);
  
  return (
    <div className='p-4'>
      
      
    </div>
  )
}

export default ClientList
