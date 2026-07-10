import { Outlet } from 'react-router-dom'
import LandingNavbar from '@/marketing/components/LandingNavbar'

const MarketingLayout = () => {
  return (
    <div>
       <LandingNavbar />
       <Outlet />
    </div>
  )
}

export default MarketingLayout
