import './App.css'
import { useAuth } from './features/auth/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './App.route';

function App() {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <Toaster position="top-center" />
      <AppRoutes isLoggedIn={isLoggedIn} user={user} loading={loading} />
    </>
  );
}

export default App;
