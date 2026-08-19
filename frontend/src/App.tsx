import { useState, useEffect } from 'react';
import api from './services/api';
import type { User } from './types';
import { Header } from './components/layout/Header';
import { AuthForm } from './components/auth/AuthForm';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { HistoryPage } from './pages/HistoryPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [prefilledCedula, setPrefilledCedula] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get<User>('/users/me');
      setUser(res.data);
    } catch {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleNavigateToPredict = (cedula: string) => {
    setPrefilledCedula(cedula);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) {
    return <AuthForm onLoginSuccess={() => { setIsAuthenticated(true); fetchUserProfile(); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />
      <main className="pb-12">
        {activeTab === 'dashboard' && <DashboardPage prefilledCedula={prefilledCedula} />}
        {activeTab === 'patients' && <PatientsPage onNavigateToPredict={handleNavigateToPredict} />}
        {activeTab === 'history' && <HistoryPage />}
      </main>
    </div>
  );
}