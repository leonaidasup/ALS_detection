import React, { useState } from 'react';
import api from '../../services/api';
import type { TokenResponse } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Activity, Lock, Mail, User, CreditCard } from 'lucide-react';

interface AuthFormProps {
  onLoginSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
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

    try {
      if (isLogin) {
        // Formato OAuth2PasswordRequestForm
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);

        const response = await api.post<TokenResponse>('/auth/login', params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        localStorage.setItem('token', response.data.access_token);
        onLoginSuccess();
      } else {
        // Registro de usuario en /users/
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
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 mb-3">
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">ALS Detection API</h1>
          <p className="text-slate-400 text-xs mt-1">Plataforma de Predicción de Biomarcadores</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <>
              <Input
                label="Nombre Completo"
                icon={User}
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Dr. Juan Pérez"
              />
              <Input
                label="Cédula"
                icon={CreditCard}
                name="cedula"
                required
                value={formData.cedula}
                onChange={handleChange}
                placeholder="1020304050"
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
            placeholder="medico@hospital.com"
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

          <Button type="submit" size="lg" className="mt-4">
            {isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};