import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User as UserIcon, LogOut, Wallet, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as ReactRouterDOM from 'react-router-dom';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, connectWithDiscord, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  }

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  const formatWalletAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
        {currentUser ? (
            <>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 w-full p-1 rounded-full bg-surface/50 hover:bg-surface/80 transition-colors border border-transparent hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-left"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <img src={currentUser.profilePic || `https://i.pravatar.cc/40?u=${currentUser.id}`} alt={currentUser.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-grow text-left overflow-hidden pr-1">
                        <p className="text-sm font-semibold text-on-surface truncate">{currentUser.name}</p>
                        <p className="text-xs text-on-surface-variant font-bold">
                           {(currentUser.trndzScore || 0).toLocaleString()}
                        </p>
                    </div>
                     <ChevronDown size={20} className={`text-on-surface-variant transition-transform mr-2 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-64 origin-top-right bg-[rgb(var(--color-surface-container))] rounded-lg shadow-2xl ring-1 ring-border/10 focus:outline-none z-[9999]"
                    >
                        <div className="py-2">
                            <div className="px-4 py-3 border-b border-border/10">
                            <p className="text-base font-bold text-on-surface truncate">{currentUser.name}</p>
                            <p className="text-xs text-on-surface-variant font-mono">{formatWalletAddress(currentUser.walletAddress)}</p>
                            </div>
                            <div className="py-2">
                            <ReactRouterDOM.Link
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 w-full px-4 py-2 text-base text-on-surface-variant hover:bg-border/10 hover:text-on-surface transition-colors"
                            >
                                <UserIcon size={18} />
                                <span>My Profile</span>
                            </ReactRouterDOM.Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-2 text-base text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Disconnect</span>
                            </button>
                            </div>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
            </>
        ) : (
            <button
                onClick={connectWithDiscord}
                className="neu-button w-full flex items-center justify-center gap-2 px-2.5 py-1.5 text-xs"
            >
                <span>Login with Discord</span>
            </button>
        )}
    </div>
  );
};