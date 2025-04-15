
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface VerificationMessageProps {
  email: string;
  onBack: () => void;
}

const VerificationMessage = ({ email, onBack }: VerificationMessageProps) => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
      </div>
      <h3 className="text-lg font-medium">Verification Email Sent</h3>
      <p>We've sent a verification link to <strong>{email}</strong></p>
      <p className="text-sm text-gray-500">
        Please check your email and click the link to activate your account.
        If you don't see the email, check your spam folder.
      </p>
      <Button 
        className="w-full" 
        variant="outline" 
        onClick={onBack}
      >
        Back to Sign In
      </Button>
    </div>
  );
};

export default VerificationMessage;
