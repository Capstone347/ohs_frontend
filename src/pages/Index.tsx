import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Packages } from '@/components/landing/Packages';
import { TrustSection } from '@/components/landing/TrustSection';
import { CTABanner } from '@/components/landing/CTABanner';

const Index = () => {
  return (
    <div className="min-h-screen bg-bg-dark">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Packages />
        <TrustSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
