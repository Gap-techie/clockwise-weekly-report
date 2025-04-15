
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface SignUpProps {
  email: string;
  setEmail: (email: string) => void;
  authMessage: { type: 'error' | 'info' | 'success'; message: string } | null;
  setAuthMessage: (message: { type: 'error' | 'info' | 'success'; message: string } | null) => void;
  onEmailSent: (sent: boolean) => void;
}

const SignUp = ({ email, setEmail, authMessage, setAuthMessage, onEmailSent }: SignUpProps) => {
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

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
        onEmailSent(true);
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
    <form onSubmit={handleSignUp} className="space-y-4">
      {authMessage && (
        <Alert 
          className={`${
            authMessage.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 
            authMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <AlertDescription>{authMessage.message}</AlertDescription>
        </Alert>
      )}
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
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignUp;
