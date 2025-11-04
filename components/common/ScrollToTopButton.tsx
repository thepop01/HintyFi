import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  scrollableSelector: string;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ scrollableSelector }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollableElement, setScrollableElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(scrollableSelector);
    setScrollableElement(element);
  }, [scrollableSelector]);

  const toggleVisibility = () => {
    if (scrollableElement && scrollableElement.scrollTop > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    scrollableElement?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (scrollableElement) {
      scrollableElement.addEventListener('scroll', toggleVisibility);
    }
    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, [scrollableElement]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-[1000] neu-button active !p-3"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
