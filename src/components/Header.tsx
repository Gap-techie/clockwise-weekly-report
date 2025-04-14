
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Clockwise</Link>
          
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link to="/reports" className="text-gray-600 hover:text-gray-900">Reports</Link>
            
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
