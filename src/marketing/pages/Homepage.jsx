import HeroSection from '../sections/HeroSection'
import EverythingYouNeed from '../sections/EverythingYouNeed'
import WorkFlowSection from '../sections/WorkflowSection'
import StepsSection from '../sections/StepsSection'
import PricingSection from '../sections/PricingSection'
import Testimonials from '../sections/Testimonials'
import ReadyToTransform from '../sections/ReadyToTransform'
import LandingFooter from '../components/LandingFooter'
const Homepage = () => {
  return (
    <div className='text-black'>
      <HeroSection />
      <EverythingYouNeed />
      <WorkFlowSection />
      <StepsSection />
      <PricingSection />
      <Testimonials />
      <ReadyToTransform />
      <LandingFooter />
    </div>
  )
}

export default Homepage
