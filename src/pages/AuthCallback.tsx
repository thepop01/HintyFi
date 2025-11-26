import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { User } from '../types';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Parse hash fragment or query params (depending on how we redirected)
      // If rewritten to /#/auth/callback?access_token=..., it's in location.search
      let params = new URLSearchParams(location.search);
      
      // Fallback: Check if params are in the hash (legacy or direct) if search is empty
      if (!params.get('access_token')) {
         const hash = window.location.hash.includes('?') 
            ? window.location.hash.split('?')[1] 
            : window.location.hash.substring(1); // Fallback attempt
         params = new URLSearchParams(hash);
      }

      const accessToken = params.get('access_token');
      const tokenType = params.get('token_type');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(params.get('error_description') || 'Authentication failed');
        return;
      }

      if (!accessToken || !tokenType) {
        setError('No access token received');
        return;
      }

      try {
        // 2. Fetch User Profile from Discord
        const response = await fetch('https://discord.com/api/users/@me', {
          headers: {
            Authorization: `${tokenType} ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Discord user profile');
        }

        const discordUser = await response.json();

        // 3. Upsert into Supabase
        // Note: This relies on "public" access or special RLS policies if Supabase Auth is disabled.
        // Assuming we map Discord ID to Supabase ID or use a custom UUID generation if needed.
        // For simplicity, we'll try to use the Discord ID as the User ID or query by platform_user_id.
        
        // Since Supabase `users` table usually expects a UUID for `id`, we might need to query first.
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('platform_user_id', discordUser.id)
          .single();

        let userId = existingUser?.id;

        if (!existingUser) {
           // Create a new UUID or let Supabase generate one if we insert without ID (if column is uuid default gen_random_uuid())
           // But wait, if we are NOT using Supabase Auth, we don't have an auth.users entry.
           // We are just inserting into public.users.
        }

        const userData: Partial<User> = {
          platform_user_id: discordUser.id,
          platform_username: discordUser.username,
          email: discordUser.email,
          profile_pic_url: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
          // socials: {
          //   discord: `/ledger/${discordUser.id}` // Default or update existing
          // }
        };

        let finalUser: User | null = null;

        if (existingUser) {
           // Update
           const { data: updatedUser, error: updateError } = await supabase
             .from('users')
             .update(userData)
             .eq('id', existingUser.id)
             .select()
             .single();
           
           if (updateError) throw updateError;
           finalUser = updatedUser;
        } else {
           // Insert
           // We let Postgres generate the ID if it's set to default gen_random_uuid()
           const { data: newUser, error: insertError } = await supabase
             .from('users')
             .insert(userData)
             .select()
             .single();
           
           if (insertError) throw insertError;
           finalUser = newUser;
        }

        // 4. Store Session
        if (finalUser) {
          localStorage.setItem('discord_access_token', accessToken);
          localStorage.setItem('current_user', JSON.stringify(finalUser));
          
          // Redirect to home
          navigate('/');
          // We might need to trigger a reload or context update if the context doesn't listen to storage.
          // Better: The Context should expose a method to set the user, but since we are redirecting, 
          // the Context will initialize from localStorage on mount/reload.
          window.location.reload(); 
        }

      } catch (err: any) {
        console.error('Auth Callback Error:', err);
        setError(err.message || 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Login Failed</h1>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p>Completing login...</p>
    </div>
  );
};

export default AuthCallback;
