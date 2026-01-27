import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Root pages that don't need a back button (main entry points)
  const rootPages = ['/', '/social', '/auth'];
  
  // Check if current path is a root page or starts with root paths
  const isRootPage = rootPages.some(page => 
    location.pathname === page || 
    (page !== '/' && location.pathname === page)
  );
  
  // Only show on mobile/tablet and non-root pages
  const shouldShow = !isRootPage && isMobile;
  
  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/social'); // Default to social home
    }
  };
  
  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleBack}
          className="fixed top-20 left-3 z-[45]
            w-10 h-10 rounded-full 
            bg-background/95 
            backdrop-blur-md shadow-lg 
            flex items-center justify-center
            border border-border/50
            hover:bg-primary/10 hover:border-primary/30
            active:bg-primary/20
            transition-colors duration-200"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default MobileBackButton;
