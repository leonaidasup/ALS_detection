import React, { useState } from 'react';
import api from '../../services/api';
import type { TokenResponse } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Activity, Lock, Mail, User, CreditCard, AlertCircle, ChevronRight } from 'lucide-react';

interface AuthFormProps {
  onLoginSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    cedula: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);

        const response = await api.post<TokenResponse>('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        localStorage.setItem('token', response.data.access_token);
        onLoginSuccess();
      } else {
        await api.post('/users/', {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          cedula: formData.cedula,
          is_active: true
        });

        setIsLogin(true);
        alert('Usuario registrado exitosamente. Ya puedes iniciar sesión.');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ocurrió un error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo con resplandor suave */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950 pointer-events-none" />

      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800/90 rounded-2xl p-8 shadow-2xl shadow-black/60">
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-100">
              ALS <b className="text-blue-400">Detection</b>
            </span>
          </div>
          <p className="text-[11px] font-mono font-semibold tracking-widest text-gray-400 uppercase">
            Plataforma Clínica
          </p>
          <h1 className="text-2xl font-bold text-gray-100 tracking-tight mt-1">
            {isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Herramientas de apoyo para la detección temprana de ELA.
          </p>
        </div>

        {/* Selector de pestañas Login / Registro */}
        <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800/80 mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isLogin 
                ? 'bg-gray-800 text-gray-100 shadow-sm border border-gray-700/50' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !isLogin 
                ? 'bg-gray-800 text-gray-100 shadow-sm border border-gray-700/50' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mb-5 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <Input
                label="Nombre Completo"
                icon={User}
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Dra. Laura Martínez"
              />
              <Input
                label="Cédula Profesional / ID"
                icon={CreditCard}
                name="cedula"
                required
                value={formData.cedula}
                onChange={handleChange}
                placeholder="RM-123456"
              />
            </>
          )}

          <Input
            label="Correo Electrónico"
            icon={Mail}
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="nombre@hospital.com"
          />

          <Input
            label="Contraseña"
            icon={Lock}
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <Button 
            type="submit" 
            variant="primary" 
            size="lg"
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full mt-2"
          >
            <span>{isLogin ? 'Entrar' : 'Crear cuenta'}</span>
            {!isLoading && <ChevronRight className="w-4 h-4" />}
          </Button>
        </form>

        {/* Nota Legal */}
        <div className="mt-6 pt-4 border-t border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Al continuar confirmas que eres un profesional autorizado.<br />
            Esta herramienta no reemplaza el criterio clínico.
          </p>
        </div>

      </div>
    </div>
  );
};