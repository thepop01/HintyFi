import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ScrollToTopButton from '../common/ScrollToTopButton';
import Breadcrumbs from '../common/Breadcrumbs';
import Footer from './Footer'; // Import the new Footer component

// Imports for the inline banner
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';


const Layout: React.FC = () => {
    const isOnline = useOnlineStatus(); // Hook to check connection status

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* The connection banner is now part of the normal document flow and pushes content down */}
            <AnimatePresence>
              {!isOnline && (
                <motion.div
                  key="connection-banner"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-yellow-500 text-black font-semibold text-sm flex items-center justify-center overflow-hidden z-[60]"
                  role="alert"
                >
                  <div className="p-2 flex items-center">
                    <WifiOff size={16} className="mr-2" />
                    Connection lost. Reconnecting...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {/* The ConnectionStatusBanner component is no longer rendered here */}
                        <Breadcrumbs />
                        <Outlet />
                        <Footer /> {/* The footer is now part of the scrollable content */}
                    </main>
                    <ScrollToTopButton scrollableSelector="main" />
                </div>
            </div>
        </div>
    );
};

export default Layout;