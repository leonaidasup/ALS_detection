import React from 'react';
import { Activity, LogOut, Users, History, LayoutDashboard } from 'lucide-react';
import type { User } from '../../types';
import { Button } from '../ui/Button';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onLogout, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'history', label: 'Historial', icon: History },
  ];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo y Nombre del Proyecto */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
            <Activity className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            ALS Detection
          </span>
        </div>

        {/* Navegación entre Pestañas */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Perfil del Médico & Botón Cerrar Sesión */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-xs font-medium text-slate-300">{user?.full_name || 'Médico Specialist'}</p>
            <p className="text-[10px] text-emerald-400 font-mono">C.C. {user?.cedula}</p>
          </div>
          <Button variant="danger" size="sm" onClick={onLogout} title="Cerrar sesión">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>

      </div>
    </header>
  );
};