import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Root pages that don't need a back button (main entry points)
  const rootPages = ['/', '/social', '/auth'];
  
  // Check if current path is a root page
  const isRootPage = rootPages.some(page => location.pathname === page);
  
  // Show on all devices, hide only on root pages
  const shouldShow = !isRootPage;
  
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
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={handleBack}
          className="fixed top-20 left-3 md:left-4 z-[45]
            flex items-center justify-center gap-2
            bg-background/95 
            backdrop-blur-md shadow-lg 
            border border-border/50
            hover:bg-primary/10 hover:border-primary/30
            active:bg-primary/20
            transition-colors duration-200
            w-10 h-10 rounded-full
            md:w-auto md:h-10 md:px-4 md:py-2 md:rounded-lg"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
          <span className="hidden md:inline text-sm font-medium text-foreground">
            Quay lại
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackButton;
