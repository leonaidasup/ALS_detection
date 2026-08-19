import React from 'react';
import { Activity, LogOut, BarChart2, Users, Clock, Sun, Moon } from 'lucide-react';
import type { User } from '../../types';
import { Button } from '../ui/Button';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User | null;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  onLogout, 
  user,
  theme,
  onToggleTheme
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Análisis', icon: BarChart2 },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'history', label: 'Historial', icon: Clock },
  ];

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'DR';

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-slate-200 dark:border-gray-800/80 shadow-sm dark:shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 dark:text-gray-100 tracking-tight flex items-center gap-1">
              ALS <b className="text-blue-600 dark:text-blue-400 font-extrabold">Detection</b>
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tracking-wider uppercase">Plataforma Diagnóstica</span>
          </div>
        </div>

        {/* Navegación Estilo Cápsula */}
        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-gray-950/60 p-1 rounded-xl border border-slate-200 dark:border-gray-800/80 transition-colors">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold 
                  transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-gray-700/60' 
                    : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-200/50 dark:hover:bg-gray-800/40'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-400'}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Perfil e Interacciones */}
        <div className="flex items-center gap-3">
          {/* Toggle de tema */}
          {onToggleTheme && (
            <button 
              onClick={onToggleTheme}
              className="p-2 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              title="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          )}

          {/* Datos del Usuario */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-xs font-bold font-mono shadow-inner">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-gray-200">{user?.full_name || 'Médico Especialista'}</p>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 font-mono">CC: {user?.cedula || '---'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors ml-1"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
};