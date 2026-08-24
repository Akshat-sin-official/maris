import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { PortfolioSection } from '../components/PortfolioSection';
import { TeamSection } from '../components/TeamSection';
import { TestimonialSlider } from '../components/TestimonialSlider';
import { ManifestoSection } from '../components/ManifestoSection';
import { NetworkSection } from '../components/NetworkSection';
import { InsightsSection } from '../components/InsightsSection';
import { CtaSection } from '../components/CtaSection';

export const HomePage: React.FC = () => {
  return (
    <main style={{ position: 'relative', backgroundColor: '#ffffff', width: '100%', overflowX: 'hidden' }}>
      <HeroSection />
      <PortfolioSection />
      <TeamSection />
      <TestimonialSlider />
      <ManifestoSection />
      <NetworkSection />
      <InsightsSection />
      <CtaSection />
    </main>
  );
};
