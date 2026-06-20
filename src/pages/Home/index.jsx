import React, { useEffect } from 'react';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import Timeline from './Timeline';
import Announcements from './Announcements';

export default function Home() {
  // Smooth reveal animations on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section > div');
    sections.forEach(section => {
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => observer.unobserve(section));
    };
  }, []);

  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <Timeline />
      <Announcements />
    </>
  );
}
