import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import LogoSection from './components/LogoSection.jsx'
import ProblemSection from './components/ProblemSection.jsx'
import SolutionSection from './components/SolutionSection.jsx'
import BuildSection from './components/BuildSection.jsx'
import ReliableSection from './components/ReliableSection.jsx'
import BenefitsTabs from './components/BenefitsTabs.jsx'
import FreeTrialSection from './components/FreeTrialSection.jsx'
import IndustriesSection from './components/IndustriesSection.jsx'
import Testimonials from './components/Testimonials.jsx'
import Faq from './components/Faq.jsx'
import FinalCta from './components/FinalCta.jsx'
import Footer from './components/Footer.jsx'
import { LinesDivider } from './components/ui.jsx'

// Section order mirrors the original DOM (CLONE_SPEC §5). There is no divider between
// Problem and Solution; the footer carries its own trailing divider.
export default function App() {
  return (
    <div className="page-wrapper">
      <main className="main-wrapper">
        <Navbar />
        <Hero />
        <LogoSection />
        <LinesDivider />
        <ProblemSection />
        <SolutionSection />
        <LinesDivider />
        <BuildSection />
        <LinesDivider />
        <ReliableSection />
        <LinesDivider />
        <BenefitsTabs />
        <LinesDivider />
        <FreeTrialSection />
        <LinesDivider />
        <IndustriesSection />
        <LinesDivider />
        <Testimonials />
        <LinesDivider />
        <Faq />
        <LinesDivider />
        <FinalCta />
        <LinesDivider />
        <Footer />
      </main>
    </div>
  )
}
