import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import BrandsMarquee from '@/components/BrandsMarquee';
import BeatsShop from '@/components/BeatsShop';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="noise relative">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <BrandsMarquee />
        <BeatsShop />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
