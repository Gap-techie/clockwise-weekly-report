
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('Sign in error:', error.message);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('Sign in successful');
      navigate('/');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Attempting to sign up:', email);
    
    try {
      // Use signUp with metadata for the profile
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) {
        console.error('Sign up error:', error.message);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error, data };
      }
      
      console.log('Sign up response:', data);
      
      // Check if email confirmation is needed
      if (data?.user?.identities?.length === 0) {
        console.log('User already exists, try signing in instead');
        return { error: { message: 'Account already exists. Please sign in instead.' }, data };
      }
      
      // If auto-confirmation is enabled (development setting), this will work right away
      if (data?.user?.confirmed_at) {
        console.log('Sign up successful with auto-confirmation');
        toast({
          title: "Account created",
          description: "You've been automatically signed in.",
        });
        navigate('/');
      } else {
        toast({
          title: "Verification needed",
          description: "Please check your email to confirm your account.",
        });
      }
      
      return { error: null, data };
    } catch (err: any) {
      console.error('Unexpected sign up error:', err);
      toast({
        title: "Sign up failed",
        description: err.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { error: err, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
