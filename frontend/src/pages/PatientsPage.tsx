import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Patient } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, Search, UserPlus, Play, User as UserIcon } from 'lucide-react';

export const PatientsPage: React.FC<{ onNavigateToPredict: (cedula: string) => void }> = ({ onNavigateToPredict }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ full_name: '', cedula: '', year_old: '' });

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get<Patient[]>('/patients/');
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/patients/', {
        full_name: form.full_name,
        cedula: form.cedula,
        year_old: parseInt(form.year_old)
      });
      setIsOpen(false);
      setForm({ full_name: '', cedula: '', year_old: '' });
      fetchPatients();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al guardar el paciente');
    }
  };

  const filtered = patients.filter(
    p => p.full_name.toLowerCase().includes(search.toLowerCase()) || p.cedula.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Directorio de Pacientes
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Pacientes registrados bajo la cuenta médica</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <UserPlus className="w-4 h-4" /> Registrar Paciente
        </Button>
      </div>

      <Input
        icon={Search}
        placeholder="Filtrar por cédula o nombre completo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="flex flex-col justify-between space-y-4 hover:border-gray-600 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-100 text-sm truncate">{p.full_name}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">CC: {p.cedula}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.year_old} años</p>
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => onNavigateToPredict(p.cedula)} className="w-full">
              <Play className="w-3.5 h-3.5 fill-current" /> Evaluar Biomarcadores
            </Button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-xs">
          No hay pacientes registrados que coincidan con los criterios.
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Paciente">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input 
            label="Nombre Completo" 
            required 
            placeholder="Ej. Pedro Perez"
            value={form.full_name} 
            onChange={e => setForm({ ...form, full_name: e.target.value })} 
          />
          <Input 
            label="Cédula" 
            required 
            placeholder="123456789"
            value={form.cedula} 
            onChange={e => setForm({ ...form, cedula: e.target.value })} 
          />
          <Input 
            label="Edad" 
            type="number" 
            required 
            placeholder="38"
            value={form.year_old} 
            onChange={e => setForm({ ...form, year_old: e.target.value })} 
          />
          <div className="flex gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="w-full">
              Cancelar
            </Button>
            <Button type="submit" className="w-full">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};