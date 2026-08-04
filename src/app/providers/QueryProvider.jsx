import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      retry:(failureCount, error)=>{
        if(error.status === 403 || error.response.status === 403){
          return false;
      }
      return failureCount < 3;
      },
    },
  },
});

const QueryProvider = ({children}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider
