import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User, Project } from '../src/types';
import { getDiscordAuthUrl } from '../src/config/discord';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  checkDiscordRoles: (projects: Project[]) => Promise<void>;
  connectWalletToUser: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check localStorage for session
      const storedUser = localStorage.getItem('current_user');
      const accessToken = localStorage.getItem('discord_access_token');

      if (storedUser && accessToken) {
        try {
          // Validate token or refresh user data if needed
          const user = JSON.parse(storedUser) as User;
          
          // Optionally verify with Supabase to get latest data
          const { data: latestUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (latestUser && !error) {
             setCurrentUser(latestUser);
             localStorage.setItem('current_user', JSON.stringify(latestUser));
          } else {
             setCurrentUser(user);
          }
        } catch (e) {
          console.error("Failed to parse stored user", e);
          localStorage.removeItem('current_user');
          localStorage.removeItem('discord_access_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signInWithDiscord = async () => {
    // Redirect to Discord OAuth
    window.location.href = getDiscordAuthUrl();
  };

  const signOut = async () => {
    localStorage.removeItem('current_user');
    localStorage.removeItem('discord_access_token');
    setCurrentUser(null);
    window.location.reload();
  };

  const checkDiscordRoles = async (projects: Project[]) => {
    console.log('Checking Discord roles for projects:', projects.map(p => p.name));
    alert('Role check functionality is not fully implemented in this client-side auth version.');
  };

  const connectWalletToUser = async (address: string) => {
    if (!currentUser) return;
    
    // Update the current user with the wallet address
    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: address })
      .eq('id', currentUser.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error connecting wallet to user:', error);
    } else if (data) {
      setCurrentUser(data);
      localStorage.setItem('current_user', JSON.stringify(data));
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithDiscord,
    signOut,
    checkDiscordRoles,
    connectWalletToUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
