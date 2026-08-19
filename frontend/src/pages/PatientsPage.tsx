import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Patient } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, Search, UserPlus, Play } from 'lucide-react';

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
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Directorio de Pacientes
          </h1>
          <p className="text-xs text-slate-400">Pacientes registrados bajo la cuenta médica</p>
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
          <Card key={p.id} className="flex flex-col justify-between space-y-3">
            <div>
              <h3 className="font-bold text-slate-200 text-sm">{p.full_name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Cédula: {p.cedula}</p>
              <p className="text-xs text-slate-500">Edad: {p.year_old} años</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onNavigateToPredict(p.cedula)}>
              <Play className="w-3.5 h-3.5" /> Evaluar Biomarcadores
            </Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar Paciente">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Nombre Completo" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          <Input label="Cédula" required value={form.cedula} onChange={e => setForm({ ...form, cedula: e.target.value })} />
          <Input label="Edad" type="number" required value={form.year_old} onChange={e => setForm({ ...form, year_old: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="w-full">Cancelar</Button>
            <Button type="submit" className="w-full">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};