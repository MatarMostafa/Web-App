
import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the device is mobile
 * 
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if the screen width is less than 768px (common mobile breakpoint)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check immediately on mount
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  return isMobile;
};
