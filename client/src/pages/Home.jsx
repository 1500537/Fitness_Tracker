import React, { useEffect } from 'react';
import PulseHeartHero from "../components/homepage/components/Hero";
import About from "./About";
import Contact from "./Contact";
import TestimonialPricing from "./Pricing";

// Network connectivity hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

const Home = () => {
  const isOnline = useNetworkStatus();
  const [wasOffline, setWasOffline] = React.useState(false);

  // Auto-refresh when connection is restored
  useEffect(() => {
    if (isOnline && wasOffline) {
      window.location.reload();
    }
    setWasOffline(!isOnline);
  }, [isOnline, wasOffline]);

  return (
    <div>
      <section id="home"><PulseHeartHero /></section>
      <section id="about"><About /></section>
      <section id="pricing"><TestimonialPricing /></section>
      <section id="contact"><Contact /></section>
    </div>
  );
};

export default Home;