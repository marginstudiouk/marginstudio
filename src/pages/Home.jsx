import React from 'react';
import HeroSection from '../components/home/HeroSection';
import SplitDecision from '../components/home/SplitDecision';
import WorkInProgressCTA from '../components/home/WorkInProgressCTA';
import FeaturedProducts from '../components/home/FeaturedProducts';
import JournalTeaser from '../components/home/JournalTeaser';

export default function Home() {
  return (
    <>
      <HeroSection />
      <SplitDecision />
      <WorkInProgressCTA />
      <FeaturedProducts />
      <JournalTeaser />
    </>
  );
}