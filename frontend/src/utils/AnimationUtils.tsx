import React from 'react';

// Define animation classes for different types of animations
export const animationClasses = {
  fadeIn: 'animate-fadeIn',
  fadeInUp: 'animate-fadeInUp',
  fadeInDown: 'animate-fadeInDown',
  fadeInLeft: 'animate-fadeInLeft',
  fadeInRight: 'animate-fadeInRight',
  zoomIn: 'animate-zoomIn',
  slideInUp: 'animate-slideInUp',
  slideInDown: 'animate-slideInDown',
  bounceIn: 'animate-bounceIn',
};

// Define CSS keyframes for animations
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideInUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @keyframes slideInDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
  
  @keyframes bounceIn {
    from {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      transform: scale(1.05);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Animation utility classes */
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out forwards;
  }
  
  .animate-fadeInDown {
    animation: fadeInDown 0.3s ease-out forwards;
  }
  
  .animate-fadeInLeft {
    animation: fadeInLeft 0.3s ease-out forwards;
  }
  
  .animate-fadeInRight {
    animation: fadeInRight 0.3s ease-out forwards;
  }
  
  .animate-zoomIn {
    animation: zoomIn 0.3s ease-out forwards;
  }
  
  .animate-slideInUp {
    animation: slideInUp 0.3s ease-out forwards;
  }
  
  .animate-slideInDown {
    animation: slideInDown 0.3s ease-out forwards;
  }
  
  .animate-bounceIn {
    animation: bounceIn 0.5s ease-out forwards;
  }
  
  /* Transition classes */
  .transition-popup {
    transition: all 0.3s ease;
  }
  
  .transition-opacity {
    transition: opacity 0.3s ease;
  }
`;

// Function to inject styles into the document head
export const injectAnimationStyles = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'popup-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = animationStyles;
      document.head.appendChild(style);
    }
  }
};

// Call the function to inject styles when this module is imported
injectAnimationStyles();

// Popup animation wrapper component
interface PopupAnimationProps {
  children: React.ReactNode;
  animationType?: keyof typeof animationClasses;
  duration?: string; // e.g., '0.3s', '0.5s'
  delay?: string;    // e.g., '0.1s', '0.2s'
  className?: string;
}

export const PopupAnimation: React.FC<PopupAnimationProps> = ({
  children,
  animationType = 'fadeInUp',
  duration = '0.3s',
  delay = '0s',
  className = ''
}) => {
  const animationClass = animationClasses[animationType];
  const animationStyle = {
    animationDuration: duration,
    animationDelay: delay,
  };

  return (
    <div 
      className={`${animationClass} ${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

// Hook for animation state management
export const useAnimationState = (isOpen: boolean) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return { isVisible, isAnimating };
};