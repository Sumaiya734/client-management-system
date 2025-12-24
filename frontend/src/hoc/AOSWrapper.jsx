import React, { useEffect } from 'react';
import AOS from 'aos';
import { useLocation } from 'react-router-dom';

const AOSWrapper = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800,
      once: false, // Changed to false so animations work on every route change
      offset: 100,
      easing: 'ease-in-out',
      delay: 50
    });

    // Refresh AOS when component mounts
    AOS.refresh();
  }, []);

  useEffect(() => {
    // Re-initialize AOS on route change to ensure animations work on every tab click
    AOS.refreshHard();
    // Small timeout to ensure DOM is fully updated before animations trigger
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }, [location.pathname, children]);

  return <div className="aos-wrapper">{children}</div>;
};

export default AOSWrapper;