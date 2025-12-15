import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User as UserIcon, LogOut, Wallet, ChevronDown, HelpCircle } from 'lucide-react';
import { useAuth } from '../../src/context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import * as ReactRouterDOM from 'react-router-dom';

export const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, signInWithDiscord, signOut } = useAuth();
  const { isWalletConnected, walletAddress, disconnectWallet } = useWallet();
  const navigate = ReactRouterDOM.useNavigate();
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
  
  const handleLogout = async () => {
    await signOut();
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
                    className="flex items-center gap-1 sm:gap-2 w-full p-1 rounded-full neu-button text-left"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <img src={currentUser.profile_pic_url || `https://i.pravatar.cc/40?u=${currentUser.id}`} alt={currentUser.platform_username} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex-shrink-0" />
                    <div className="flex-grow text-left overflow-hidden pr-1 hidden sm:block">
                        <p className="text-xs sm:text-sm font-semibold text-on-surface truncate">{currentUser.platform_username}</p>
                    </div>
                     <ChevronDown size={16} className={`text-on-surface-variant transition-transform mr-1 sm:mr-2 sm:w-5 sm:h-5 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                    {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-48 sm:w-56 md:w-64 origin-top-right glassmorphic p-0 focus:outline-none z-[9999]"
                    >
                        <div className="py-1 px-1 flex flex-col items-center">
                            <div className="px-2 sm:px-4 py-3 border-b border-border/10 flex items-center gap-2 sm:gap-3">
                                <img src={currentUser.profile_pic_url || `https://i.pravatar.cc/40?u=${currentUser.id}`} alt={currentUser.platform_username} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                                <div className="flex flex-col">
                                    <p className="text-sm sm:text-base font-bold text-on-surface truncate">{currentUser.platform_username}</p>
                                    <p className="text-xs sm:text-sm text-on-surface-variant font-bold">{currentUser.hint_points || 0} Hint Points</p>
                                </div>
                            </div>
                            <div className="py-1 px-1">
                                <ReactRouterDOM.Link
                                    to={`/ledger/${currentUser.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-base text-on-surface-variant hover:text-primary neu-button m-2"
                                >
                                    <UserIcon size={18} />
                                    <span>Profile</span>
                                </ReactRouterDOM.Link>

                                <div className="px-2 py-1.5 m-2">
                                    <ConnectButton.Custom>
                                    {({
                                        account,
                                        chain,
                                        openAccountModal,
                                        openChainModal,
                                        openConnectModal,
                                        authenticationStatus,
                                        mounted,
                                    }) => {
                                        const ready = mounted && authenticationStatus !== 'loading';
                                        const connected =
                                        ready &&
                                        account &&
                                        chain &&
                                        (!authenticationStatus ||
                                            authenticationStatus === 'authenticated');

                                        // Show stored wallet address if user is logged in but wallet not connected
                                        const storedWalletAddress = currentUser?.wallet_address;

                                        return (
                                        <div
                                            {...(!ready && {
                                            'aria-hidden': true,
                                            'style': {
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                            },
                                            })}
                                        >
                                            {(() => {
                                            if (!connected && !storedWalletAddress) {
                                                return (
                                                    <button onClick={openConnectModal} type="button" className="flex items-center justify-between w-full px-4 py-2 text-base text-on-surface-variant neu-button hover:text-primary">
                                                        <span>Wallet</span>
                                                        <span className="text-sm">Connect</span>
                                                    </button>
                                                );
                                            }

                                            if (!connected && storedWalletAddress) {
                                                // Show stored wallet address, allow reconnection
                                                return (
                                                    <button onClick={openConnectModal} type="button" className="flex items-center justify-between w-full px-4 py-2 text-base text-on-surface-variant neu-button hover:text-primary">
                                                        <span>Wallet</span>
                                                        <span className="text-sm">{formatWalletAddress(storedWalletAddress)} (Reconnect)</span>
                                                    </button>
                                                );
                                            }

                                            if (chain.unsupported) {
                                                return (
                                                <button onClick={openChainModal} type="button" className="flex items-center justify-between w-full px-4 py-2 text-base text-on-surface-variant neu-button hover:text-red-500">
                                                    <span>Wallet</span>
                                                    <span className="text-sm">Wrong network</span>
                                                </button>
                                                );
                                            }

                                            return (
                                                <button onClick={openAccountModal} type="button" className="flex items-center justify-between w-full px-4 py-2 text-base text-on-surface-variant neu-button hover:text-primary">
                                                    <span>Logout Wallet</span>
                                                    <span className="text-sm">{account.displayName}</span>
                                                </button>
                                            );
                                            })()}
                                        </div>
                                        );
                                    }}
                                    </ConnectButton.Custom>
                                </div>

                                <button className="flex items-center justify-between w-full px-4 py-2 text-base text-on-surface-variant neu-button m-2 hover:text-primary">
                                    <span>Social</span>
                                    <div className="flex gap-1">
                                        <img src="/discord-logo.svg" alt="Discord" className="w-4 h-4" />
                                    </div>
                                </button>

                                <button className="flex items-center gap-3 w-full px-4 py-2 text-base text-on-surface-variant neu-button m-2 hover:text-primary">
                                    <HelpCircle size={18} />
                                    <span>Help & Support</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-base text-on-surface-variant hover:text-red-400 neu-button m-2"
                                >
                                    <LogOut size={18} />
                                    <span>Logout Discord</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
            </>
        ) : (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 sm:gap-2 w-full p-1 rounded-full neu-button text-left justify-center"
                >
                    <span className="text-xs sm:text-sm">Profile</span>
                    <ChevronDown size={14} className={`text-on-surface-variant transition-transform sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                    {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-48 sm:w-56 md:w-64 origin-top-right glassmorphic p-0 focus:outline-none z-[9999]"
                    >
                        <div className="text-center p-2 sm:p-4">
                            <h2 className="text-lg sm:text-2xl font-bold text-on-surface">Get the Hint</h2>
                            <p className="text-xs sm:text-sm text-on-surface-variant mb-4 sm:mb-6">Stay Updated</p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        signInWithDiscord();
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-3 w-full px-4 py-3 text-base font-semibold text-on-surface bg-surface-container-high rounded-full neu-button"
                                >
                                    <img src="/discord-logo.svg" alt="Discord" className="w-6 h-6" />
                                    <span>Login Discord</span>
                                </button>
                                <div className="neu-button rounded-full">
                                    <ConnectButton.Custom>
                                    {({
                                        account,
                                        chain,
                                        openAccountModal,
                                        openChainModal,
                                        openConnectModal,
                                        authenticationStatus,
                                        mounted,
                                    }) => {
                                        const ready = mounted && authenticationStatus !== 'loading';
                                        const connected =
                                        ready &&
                                        account &&
                                        chain &&
                                        (!authenticationStatus ||
                                            authenticationStatus === 'authenticated');
                                        return (
                                        <div
                                            {...(!ready && {
                                            'aria-hidden': true,
                                            'style': {
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                userSelect: 'none',
                                            },
                                            })}
                                        >
                                            {(() => {
                                            if (!connected) {
                                                return (
                                                    <button onClick={openConnectModal} type="button" className="flex items-center justify-center gap-3 w-full px-4 py-3 text-base font-semibold text-on-surface bg-surface-container-high rounded-full">
                                                        <Wallet size={24} />
                                                        Login Wallet
                                                    </button>
                                                );
                                            }
                                            if (chain.unsupported) {
                                                return (
                                                <button onClick={openChainModal} type="button" className="flex items-center justify-center gap-3 w-full px-4 py-3 text-base font-semibold text-on-surface bg-red-500 rounded-full">
                                                    Wrong network
                                                </button>
                                                );
                                            }
                                            return (
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                <button
                                                    onClick={openChainModal}
                                                    style={{ display: 'flex', alignItems: 'center' }}
                                                    type="button"
                                                >
                                                    {chain.hasIcon && (
                                                    <div
                                                        style={{
                                                        background: chain.iconBackground,
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: 999,
                                                        overflow: 'hidden',
                                                        marginRight: 4,
                                                        }}
                                                    >
                                                        {chain.iconUrl && (
                                                        <img
                                                            alt={chain.name ?? 'Chain icon'}
                                                            src={chain.iconUrl}
                                                            style={{ width: 24, height: 24 }}
                                                        />
                                                        )}
                                                    </div>
                                                    )}
                                                </button>
                                                <button onClick={openAccountModal} type="button" className="text-base font-semibold text-on-surface">
                                                    {account.displayName}
                                                    {account.displayBalance
                                                    ? ` (${account.displayBalance})`
                                                    : ''}
                                                </button>
                                                </div>
                                            );
                                            })()}
                                        </div>
                                        );
                                    }}
                                    </ConnectButton.Custom>
                                </div>
                                <button className="flex items-center justify-center gap-3 w-full px-4 py-3 text-base font-semibold text-on-surface bg-surface-container-high rounded-full neu-button">
                                    <UserIcon size={24} />
                                    <span>Other Socials</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )}
    </div>
  );
};
