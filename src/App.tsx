import { MotionConfig } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroShowcase from './components/HeroShowcase';
import Highlights from './components/Highlights';
import Experience from './components/Experience';
import VhsProjects from './components/VhsProjects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AvailableBanner from './components/AvailableBanner';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-black text-snow overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-rose focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-snow"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" tabIndex={-1} className="outline-none">
          <HeroShowcase />
          <Highlights />
          <Experience />
          <VhsProjects />
          <Skills />
          <Contact />
        </main>
        <Footer />
        <AvailableBanner />
      </div>
    </MotionConfig>
  );
}

export default App;
