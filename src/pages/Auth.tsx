
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [authMessage, setAuthMessage] = useState<{type: 'error' | 'info' | 'success', message: string} | null>(null);
  const { signIn, signUp, user } = useAuth();
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setAuthMessage({
          type: 'error',
          message: error.message || 'Error signing in'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      setAuthMessage({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setAuthMessage({
        type: 'error',
        message: 'Please enter your full name'
      });
      return;
    }
    
    setAuthMessage(null);
    setIsLoading(true);
    
    try {
      const { error, data } = await signUp(email, password, fullName);
      
      if (error) {
        setAuthMessage({
          type: 'error',
          message: error.message || 'Error signing up'
        });
        
        // If the error suggests the user already exists, show helpful message
        if (error.message?.includes('already exists') || data?.user?.identities?.length === 0) {
          setAuthMessage({
            type: 'info',
            message: 'Account already exists. Try signing in instead.'
          });
        }
      } else if (data?.user?.confirmed_at) {
        // Auto-confirmation is enabled
        toast({
          title: 'Account created!',
          description: 'You have been automatically signed in.',
        });
      } else {
        // Email confirmation required
        setEmailSent(true);
        setAuthMessage({
          type: 'success',
          message: 'Please check your email to confirm your account.'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      setAuthMessage({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {authMessage && (
            <Alert 
              className={`mb-4 ${
                authMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 
                authMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
                'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <AlertDescription>
                {authMessage.message}
              </AlertDescription>
            </Alert>
          )}
          
          {emailSent ? (
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-medium">Verification Email Sent</h3>
              <p>We've sent a verification link to <strong>{email}</strong></p>
              <p>Please check your email and click the link to activate your account.</p>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setEmailSent(false)}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium">Email</label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium">Password</label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
