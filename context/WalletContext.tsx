import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAuth } from './AuthContext';
import { createUserWithWallet } from '../src/services/dataService';

interface WalletContextType {
  connectWallet: () => void;
  disconnectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress: string | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: React.PropsWithChildren) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { currentUser, loading, connectWalletToUser } = useAuth();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address) {
        if (!currentUser) {
          // If wallet is connected but no user exists, create a new user with wallet
          // This wallet connection will be temporary until Discord login is completed
          await createUserWithWallet(address);
        } else if (currentUser.wallet_address !== address) {
          // If user exists but wallet address is different, update the user
          // This persists the wallet connection in the database
          await connectWalletToUser(address);
        }
        // If user exists and wallet address matches, wallet is already connected and persisted
      }
    };

    if (!loading) {
      handleWalletConnection();
    }
  }, [isConnected, address, currentUser, loading]);

  // Handle user logout - disconnect wallet when user logs out
  useEffect(() => {
    if (!currentUser && !loading) {
      // User has logged out, disconnect wallet
      if (isWalletConnected) {
        disconnect();
      }
    }
  }, [currentUser, loading, isWalletConnected]);

  // Handle automatic wallet reconnection when user logs in with stored wallet
  useEffect(() => {
    const handleAutoReconnect = async () => {
      if (currentUser && !loading && currentUser.wallet_address && !isConnected) {
        // User is logged in, has a stored wallet address, but wallet is not connected
        // The wallet will show as connected in the UI based on the stored address
        // but the actual blockchain connection needs to be initiated by the user through RainbowKit
        console.log('User has stored wallet address:', currentUser.wallet_address);
        // The wallet connection state is managed by wagmi and RainbowKit
        // The user will see their stored wallet address in the UI and can reconnect if needed
      }
    };

    handleAutoReconnect();
  }, [currentUser, loading, isConnected]);

  const connectWallet = () => {
    // This function is intentionally empty as the actual connection
    // is handled by RainbowKit's ConnectButton
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const value = {
    connectWallet,
    disconnectWallet,
    isWalletConnected,
    walletAddress: address,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}