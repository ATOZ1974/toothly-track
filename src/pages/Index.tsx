import { useAuth } from '@/contexts/AuthContext';
import { DentalManagement } from '@/components/dental/DentalManagement';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div>
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-semibold text-dental-800">
            Welcome, {user?.user_metadata?.full_name || user?.email}
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>
      <DentalManagement />
    </div>
  );
};

export default Index;
