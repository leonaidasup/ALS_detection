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
  
  // Manejo del tema claro/oscuro compatible con Tailwind v4
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('als-theme') as 'dark' | 'light';
    return saved || 'dark';
  });

  // Alterna correctamente la clase .dark en <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('als-theme', theme);
  }, [theme]);

  // Lógica de autenticación y sesión
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 transition-colors duration-200">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      
      {/* Contenedor principal responsive adaptativo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardPage prefilledCedula={prefilledCedula} />}
        {activeTab === 'patients' && <PatientsPage onNavigateToPredict={handleNavigateToPredict} />}
        {activeTab === 'history' && <HistoryPage />}
      </main>

      {/* Pie de página con Tailwind moderno */}
      <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4 px-6 text-xs text-slate-500 dark:text-gray-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>ALS Detection · Herramienta de apoyo clínico ML</span>
          <span>v1.0.0 · Datos protegidos</span>
        </div>
      </footer>
    </div>
  );
}