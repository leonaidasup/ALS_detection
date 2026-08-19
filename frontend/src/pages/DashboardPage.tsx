import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Patient, AnalysisResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, Play, UserCheck, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REQUIRED_BIOMARKERS = [
  'glucose', 'cholesterol', 'triglycerides', 'hdl', 'ldl', 
  'creatinine', 'urea', 'hemoglobin', 'white_blood_cells', 'platelets'
];

export const DashboardPage: React.FC<{ prefilledCedula?: string }> = ({ prefilledCedula }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState(prefilledCedula || '');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [biomarkerFilter, setBiomarkerFilter] = useState('');
  const [biomarkerValues, setBiomarkerValues] = useState<Record<string, string>>(
    REQUIRED_BIOMARKERS.reduce((acc, b) => ({ ...acc, [b]: '' }), {})
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Patient[]>('/patients/').then(res => setPatients(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (prefilledCedula && patients.length > 0) {
      const match = patients.find(p => p.cedula === prefilledCedula);
      if (match) setSelectedPatient(match);
    }
  }, [prefilledCedula, patients]);

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Selecciona un paciente antes de continuar');

    setLoading(true);
    setError('');

    const numericBiomarkers: Record<string, number> = {};
    REQUIRED_BIOMARKERS.forEach(key => {
      numericBiomarkers[key] = parseFloat(biomarkerValues[key]) || 0.0;
    });

    try {
      const response = await api.post<AnalysisResponse>('/analysis/', {
        patient_id: selectedPatient.id,
        biomarkers: numericBiomarkers
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al ejecutar el modelo ML');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    p => p.cedula.includes(patientSearch) || p.full_name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const visibleBiomarkers = REQUIRED_BIOMARKERS.filter(b => 
    b.toLowerCase().includes(biomarkerFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Columna Formulario */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Búsqueda de Pacientes */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" /> 1. Búsqueda y Selección de Paciente
          </h2>

          {!selectedPatient ? (
            <div className="space-y-2">
              <Input
                icon={Search}
                placeholder="Ingresa cédula o nombre..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              {patientSearch && (
                <div className="max-h-36 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl divide-y divide-slate-700/50">
                  {filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPatient(p); setPatientSearch(p.cedula); }}
                      className="p-2.5 hover:bg-slate-700/50 cursor-pointer text-xs flex justify-between items-center"
                    >
                      <span className="font-medium text-slate-200">{p.full_name}</span>
                      <span className="text-slate-400 font-mono">CC: {p.cedula}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">{selectedPatient.full_name}</p>
                  <p className="text-xs text-slate-400">CC: {selectedPatient.cedula} | {selectedPatient.year_old} años</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-xs text-rose-400 hover:underline cursor-pointer">
                Cambiar
              </button>
            </div>
          )}
        </Card>

        {/* Captura de Biomarcadores */}
        <form onSubmit={handleRunInference}>
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-400" /> 2. Medición de Biomarcadores
              </h2>
              <input
                type="text"
                placeholder="Filtrar biomarcador..."
                value={biomarkerFilter}
                onChange={(e) => setBiomarkerFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {visibleBiomarkers.map((key) => (
                <div key={key} className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-xl">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">{key}</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={biomarkerValues[key]}
                    onChange={(e) => setBiomarkerValues({ ...biomarkerValues, [key]: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <Button type="submit" disabled={loading} size="lg">
              <Play className="w-4 h-4" />
              {loading ? 'Calculando Inferencia...' : 'Ejecutar Modelo ML'}
            </Button>
          </Card>
        </form>
      </div>

      {/* Explicabilidad SHAP y Resultado */}
      <div className="lg:col-span-5">
        <Card className="h-full flex flex-col justify-center">
          {!result ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Completa la medición y ejecuta el análisis para visualizar el dictamen y los valores SHAP.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Inferencia del Modelo</span>
                <div className="mt-2 flex justify-center">
                  <Badge variant={result.prediction === 'Positivo' ? 'positive' : 'negative'}>
                    {result.prediction === 'Positivo' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="text-base font-bold px-1">{result.prediction}</span>
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Probabilidad: <span className="text-slate-100 font-bold">{(result.probability * 100).toFixed(2)}%</span>
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Mayor Impacto (Explicabilidad SHAP)</h3>
                <div className="space-y-1.5">
                  {Object.entries(result.shap_values || {}).slice(0, 5).map(([bio, val]) => (
                    <div key={bio} className="bg-slate-800/60 p-2 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-300">{bio}</span>
                      <span className={`font-mono font-bold ${val >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {val > 0 ? `+${val}` : val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};