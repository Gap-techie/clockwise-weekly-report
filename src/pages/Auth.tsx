
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabaseClient';
import SignIn from '@/components/auth/SignIn';
import SignUp from '@/components/auth/SignUp';
import VerificationMessage from '@/components/auth/VerificationMessage';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [authMessage, setAuthMessage] = useState<{type: 'error' | 'info' | 'success', message: string} | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Check for confirmation hash in URL (for email confirmations)
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=signup')) {
        try {
          const { error } = await supabase.auth.getSession();
          if (!error) {
            toast({
              title: 'Account confirmed',
              description: 'Your account has been confirmed. You can now sign in.',
            });
          }
        } catch (err) {
          console.error('Error confirming email:', err);
        }
      }
    };

    handleEmailConfirmation();
  }, [toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Clockwise</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to track your time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emailSent ? (
            <VerificationMessage 
              email={email} 
              onBack={() => setEmailSent(false)} 
            />
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <SignIn 
                  email={email} 
                  setEmail={setEmail} 
                  authMessage={authMessage} 
                />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignUp 
                  email={email} 
                  setEmail={setEmail} 
                  authMessage={authMessage}
                  setAuthMessage={setAuthMessage}
                  onEmailSent={setEmailSent}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
