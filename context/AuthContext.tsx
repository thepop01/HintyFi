import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// FIX: Add Project type import
import { User, Project } from '../src/types';
import { useToast } from './ToastContext';
// FIX: Add updateUser import
import { getUserById, getUsers, updateUser } from '../src/services/dataService';
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
  // FIX: Add checkDiscordRoles to the context type
  checkDiscordRoles: (projectsToCheck: Project[]) => Promise<void>;
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

  // FIX: Implement the checkDiscordRoles function
  const checkDiscordRoles = async (projectsToCheck: Project[]) => {
    if (!currentUser) {
        addToast('Please log in to check roles.', 'info');
        return;
    }
    if (!currentUser.discordId) {
        addToast('Your Discord account is not connected. Please edit your profile.', 'warning');
        return;
    }

    addToast('Connecting to Discord to check roles...', 'info');

    // --- SIMULATION of Discord OAuth and API calls ---
    await new Promise(resolve => setTimeout(resolve, 2000));

    const requiredRoles = projectsToCheck.flatMap(p => p.discordRoles || []).map(r => r.name);
    const uniqueRequiredRoles = [...new Set(requiredRoles)];

    const currentUserRoles = new Set(currentUser.discordRoles || []);

    const newRolesFound: string[] = [];
    for (const requiredRole of uniqueRequiredRoles) {
        if (!currentUserRoles.has(requiredRole)) {
            newRolesFound.push(requiredRole);
            // Just find up to 2 for demonstration
            if (newRolesFound.length >= 2) break;
        }
    }

    if (newRolesFound.length === 0) {
        addToast('No new Discord roles found. You are up to date!', 'success');
        return;
    }

    const updatedUser: User = {
        ...currentUser,
        discordRoles: [...(currentUser.discordRoles || []), ...newRolesFound],
    };

    if (updateUser(updatedUser)) {
        addToast(`Found and verified ${newRolesFound.length} new role(s)! Your profile is updated.`, 'success');
    } else {
        addToast('Failed to update your profile with new roles.', 'error');
    }
    // --- END SIMULATION ---
  };

  const value = { currentUser, connectWithDiscord, logout, loginAsUser, checkDiscordRoles };

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
