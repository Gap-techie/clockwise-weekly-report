
import { Button } from '@/components/ui/button';

interface VerificationMessageProps {
  email: string;
  onBack: () => void;
}

const VerificationMessage = ({ email, onBack }: VerificationMessageProps) => {
  return (
    <div className="space-y-4 text-center">
      <h3 className="text-lg font-medium">Verification Email Sent</h3>
      <p>We've sent a verification link to <strong>{email}</strong></p>
      <p>Please check your email and click the link to activate your account.</p>
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
