import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1️⃣ Check for session manually (important for hash routers)
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Clean up messy hash from Discord login redirect
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, '/#/ecosystem');
      }
    };

    initSession();

    // 2️⃣ Listen for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);

      // optional cleanup on login
      if (session && window.location.hash.includes('access_token')) {
        window.history.replaceState({}, document.title, '/#/ecosystem');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
