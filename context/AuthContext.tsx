import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../src/services/supabaseClient';
import { User, Project } from '../src/types';
import { Session } from '@supabase/supabase-js';

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
    // Clear any OAuth errors from the URL on initial load
    const url = new URL(window.location.href);
    if (url.searchParams.has('error')) {
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      window.history.replaceState({}, document.title, url.pathname + url.hash);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          if (session) {
            await handleAuthSession(session);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSession = async (session: Session) => {
    console.log('Handling auth session for user:', session.user);
    
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user profile:', error);
      return;
    }

    if (userProfile) {
      // Check and correct profile picture URL for existing users
      const correctAvatarUrl = session.user.user_metadata.avatar_url;
      if (userProfile.profile_pic_url !== correctAvatarUrl) {
        const { data: updatedUser } = await supabase
          .from('users')
          .update({ profile_pic_url: correctAvatarUrl })
          .eq('id', userProfile.id)
          .select()
          .single();
        setCurrentUser(updatedUser || userProfile);
      } else {
        setCurrentUser(userProfile);
      }

      // Ensure existing users have the correct discord profile link
      if (!userProfile.socials?.discord) {
        const { data: updatedUserWithSocials } = await supabase
          .from('users')
          .update({ socials: { ...userProfile.socials, discord: `/ledger/${userProfile.id}` } })
          .eq('id', userProfile.id)
          .select()
          .single();
        if (updatedUserWithSocials) {
          setCurrentUser(updatedUserWithSocials);
        }
      }

      // Temporary logic to assign super_admin role
      const superAdminDiscordId = '1172958200455245827';
      if (userProfile.platform_user_id === superAdminDiscordId && userProfile.role !== 'super_admin') {
        const { data: updatedUser } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', userProfile.id)
          .select()
          .single();
        setCurrentUser(updatedUser || userProfile);
      }
      
      // Auto-connect wallet if user has one stored in DB
      if (userProfile.wallet_address) {
        // The wallet reconnection will be handled by WalletContext
        // when it detects the user is logged in and has a wallet address
      }
    } else {
      // If no profile exists, create one
      const newUser: Partial<User> = {
        id: session.user.id,
        email: session.user.email,
        platform_user_id: session.user.user_metadata.provider_id,
        platform_username: session.user.user_metadata.full_name,
        profile_pic_url: session.user.user_metadata.avatar_url, // Use the URL directly
        socials: {
          discord: `/ledger/${session.user.id}`
        }
      };
      
      const { data: createdUser, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
      } else {
        setCurrentUser(createdUser);
      }
    }
  };

  const signInWithDiscord = async () => {
    try {
      console.log('Attempting Discord login...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${import.meta.env.VITE_SITE_URL || window.location.origin}`
        }
      });
      
      if (error) {
        console.error('Error signing in with Discord:', error);
        alert(`Discord login failed: ${error.message}`);
      } else {
        console.log('Discord login initiated successfully:', data);
      }
    } catch (err) {
      console.error('Unexpected error during Discord login:', err);
      alert(`Unexpected error: ${err}`);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Clear user state and disconnect wallet on logout
    setCurrentUser(null);
    // The wallet disconnection will be handled by WalletContext when it detects user is null
  };

  const checkDiscordRoles = async (projects: Project[]) => {
    // Placeholder implementation.
    // In a real application, this would involve API calls to your backend
    // to verify the user's Discord roles for the given projects.
    console.log('Checking Discord roles for projects:', projects.map(p => p.name));
    alert('Role check functionality is not fully implemented in this mock.');
    // Simulate an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
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
