import React from 'react'
import { useEmployees } from '../api/queries'

const EmployeeList = () => {

  const {data} = useEmployees()

  console.log(data);
  

  return (
    <div className='h-full p-4'>
       Employees
    </div>
  )
}

export default EmployeeList
