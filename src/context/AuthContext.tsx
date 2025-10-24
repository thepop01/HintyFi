import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../src/types';
import { useToast } from './ToastContext';
import { getUserById, getUsers } from '../src/services/dataService';
import LoginAsModal from '../components/auth/LoginAsModal';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface AuthContextType {
  currentUser: User | null;
  connectWithDiscord: () => Promise<void>;
  logout: () => void;
  loginAsUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { addToast } = useToast();

  const logout = useCallback(() => {
    addToast('You have been disconnected.', 'info');
    setCurrentUser(null);
  }, [addToast]);

  useEffect(() => {
    const handleDataChange = () => {
      if (currentUser) {
        const refreshedUser = getUserById(currentUser.id);
        if (refreshedUser) {
          if (JSON.stringify(currentUser) !== JSON.stringify(refreshedUser)) {
             if (currentUser.role !== refreshedUser.role) {
                addToast('Your user role has been updated.', 'info');
             } else if (JSON.stringify(currentUser.associatedProjectIds) !== JSON.stringify(refreshedUser.associatedProjectIds)) {
                addToast('Your project permissions have been updated.', 'info');
             }
             setCurrentUser(refreshedUser);
          }
        } else {
          // The user was deleted, so log them out.
          logout();
        }
      }
    };

    window.addEventListener('datachanged', handleDataChange);

    return () => {
      window.removeEventListener('datachanged', handleDataChange);
    };
  }, [currentUser, addToast, logout]);

  const connectWithDiscord = async () => {
    // Instead of logging in a hardcoded user, open the "Login As" modal.
    setIsLoginModalOpen(true);
  };

  const loginAsUser = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
        setCurrentUser(user);
        addToast(`Logged in as ${user.name}.`, 'success');
        setIsLoginModalOpen(false);
    } else {
        addToast('User not found.', 'error');
    }
  };

  const value = { currentUser, connectWithDiscord, logout, loginAsUser };

  return (
    <AuthContext.Provider value={value}>
        {children}
        <LoginAsModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={loginAsUser}
            allUsers={getUsers()}
        />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}