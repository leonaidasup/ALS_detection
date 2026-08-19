import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Patient, AnalysisResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Search, Play, UserCheck, Activity, 
  AlertTriangle, CheckCircle2, ListFilter, BarChart2, 
  TestTube2, Sparkles, Check, Loader2 
} from 'lucide-react';

export const DashboardPage: React.FC<{ prefilledCedula?: string }> = ({ prefilledCedula }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState(prefilledCedula || '');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Lista exacta de biomarcadores retornada por `ml_service.required_variables`
  const [requiredBiomarkers, setRequiredBiomarkers] = useState<string[]>([]);
  const [loadingBiomarkers, setLoadingBiomarkers] = useState<boolean>(true);
  const [biomarkerFilter, setBiomarkerFilter] = useState('');
  const [biomarkerValues, setBiomarkerValues] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [showAllShap, setShowAllShap] = useState(false);

  // 1. Cargar pacientes y biomarcadores reales desde el modelo backend
  useEffect(() => {
    // Petición de pacientes
    api.get<Patient[]>('/patients/')
      .then(res => setPatients(res.data))
      .catch(console.error);

    // Petición a @router.get("/biomarkers")
    setLoadingBiomarkers(true);
    api.get<string[]>('/analyses/biomarkers')
      .then(res => {
        setRequiredBiomarkers(res.data);
        initBiomarkerState(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar biomarcadores del modelo:", err);
        setError('No se pudieron obtener las variables requeridas por el modelo ML.');
      })
      .finally(() => setLoadingBiomarkers(false));
  }, []);

  const initBiomarkerState = (vars: string[]) => {
    const initialValues: Record<string, string> = {};
    vars.forEach(v => { initialValues[v] = ''; });
    setBiomarkerValues(initialValues);
  };

  useEffect(() => {
    if (prefilledCedula && patients.length > 0) {
      const match = patients.find(p => p.cedula === prefilledCedula);
      if (match) setSelectedPatient(match);
    }
  }, [prefilledCedula, patients]);

  // Cargar valores de prueba para los biomarcadores reales del modelo
  const handleQuickFill = () => {
    const mockData: Record<string, string> = {};
    requiredBiomarkers.forEach(key => {
      // Genera valores numéricos flotantes de prueba
      mockData[key] = (Math.random() * 5 + 1).toFixed(3);
    });
    setBiomarkerValues(mockData);
  };

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Selecciona un paciente antes de continuar');

    setLoading(true);
    setError('');

    // 1. Limpieza de biomarcadores
    const numericBiomarkers: Record<string, number> = {};
    requiredBiomarkers.forEach(key => {
        const parsed = parseFloat(biomarkerValues[key]);
        numericBiomarkers[key] = isNaN(parsed) ? 0.0 : parsed;
    });

    try {
        // 2. Enviamos el UUID directamente (sin parseInt)
        const response = await api.post<AnalysisResponse>('/analyses/', {
        patient_id: selectedPatient.id, // 👈 Enviamos la cadena UUID tal cual
        biomarkers: numericBiomarkers
        });
        setResult(response.data);
    } catch (err: any) {
        const detail = err.response?.data?.detail;

        if (typeof detail === 'string') {
        setError(detail);
        } else if (Array.isArray(detail)) {
        const formattedErrors = detail
            .map((item: any) => `${item.loc ? item.loc.join(' -> ') : ''}: ${item.msg}`)
            .join(' | ');
        setError(`Error de validación: ${formattedErrors}`);
        } else {
        setError('Error al comunicar con el servidor');
        }
    } finally {
        setLoading(false);
    }
    };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredPatients = patients.filter(
    p => p.cedula.includes(patientSearch) || p.full_name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const visibleBiomarkers = requiredBiomarkers.filter(b => 
    b.toLowerCase().includes(biomarkerFilter.toLowerCase()) || 
    formatLabel(b).toLowerCase().includes(biomarkerFilter.toLowerCase())
  );

  const filledCount = requiredBiomarkers.filter(b => biomarkerValues[b] !== undefined && biomarkerValues[b] !== '').length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Columna Izquierda: Selección de Paciente y Captura */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Paso 1: Búsqueda de Paciente */}
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

        {/* Paso 2: Captura Dinámica según `ml_service.required_variables` */}
        <form onSubmit={handleRunInference}>
          <Card className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-emerald-400" /> 2. Captura de Biomarcadores
                </h2>
                <p className="text-[11px] text-slate-400">
                  Variables requeridas por el modelo ML ({requiredBiomarkers.length})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  disabled={loadingBiomarkers}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cargar Ejemplo</span>
                </button>

                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={biomarkerFilter}
                  onChange={(e) => setBiomarkerFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500 w-28"
                />
              </div>
            </div>

            {loadingBiomarkers ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
                <p className="text-xs">Cargando biomarcadores del archivo pkl...</p>
              </div>
            ) : (
              <>
                {/* Entradas de texto dinámicas para los biomarcadores del backend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {visibleBiomarkers.map((key) => {
                    const isFilled = biomarkerValues[key] !== undefined && biomarkerValues[key] !== '';

                    return (
                      <div 
                        key={key} 
                        className={`p-2.5 rounded-xl border transition-all ${
                          isFilled 
                            ? 'bg-emerald-950/10 border-emerald-500/40' 
                            : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-medium text-slate-200 flex items-center gap-1">
                            {formatLabel(key)}
                            {isFilled && <Check className="w-3 h-3 text-emerald-400" />}
                          </label>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">{key}</span>
                        </div>
                        <input
                          type="number"
                          step="any"
                          required
                          value={biomarkerValues[key] ?? ''}
                          onChange={(e) => setBiomarkerValues({ ...biomarkerValues, [key]: e.target.value })}
                          placeholder="0.00"
                          className={`w-full bg-slate-800 border text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono ${
                            isFilled ? 'border-emerald-500/50 focus:border-emerald-400' : 'border-slate-700 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

            <Button type="submit" disabled={loading || loadingBiomarkers} size="lg">
              <Play className="w-4 h-4" />
              {loading ? 'Calculando Inferencia...' : 'Ejecutar Modelo ML'}
            </Button>
          </Card>
        </form>
      </div>

      {/* Columna Derecha: Explicabilidad e Impacto SHAP */}
      <div className="lg:col-span-5">
        <Card className="h-full flex flex-col justify-start">
          {!result ? (
            <div className="text-center py-16 my-auto">
              <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Selecciona un paciente, llena los biomarcadores requeridos y ejecuta la inferencia para ver los resultados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Dictamen Diagnóstico</span>
                <div className="mt-2 flex justify-center">
                  <Badge variant={result.prediction === 'Positivo' ? 'positive' : 'negative'}>
                    {result.prediction === 'Positivo' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="text-base font-bold px-1">{result.prediction}</span>
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Probabilidad estimada: <span className="text-slate-100 font-bold font-mono">{(result.probability * 100).toFixed(2)}%</span>
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-emerald-400" /> Biomarcadores e Impacto SHAP
                  </h3>
                  <button
                    onClick={() => setShowAllShap(!showAllShap)}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ListFilter className="w-3 h-3" />
                    {showAllShap ? 'Ver Top 5' : 'Ver Todos'}
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {Object.entries(result.shap_values || {})
                    .slice(0, showAllShap ? undefined : 5)
                    .map(([bio, shapVal]) => {
                      const inputValue = result.input_data?.[bio];

                      return (
                        <div key={bio} className="bg-slate-800/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between hover:bg-slate-800 transition-colors">
                          <div>
                            <p className="font-semibold text-slate-200 text-xs">{formatLabel(bio)}</p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              Valor medido: <span className="text-emerald-400 font-bold font-mono">{inputValue ?? 'N/A'}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              shapVal >= 0 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {shapVal > 0 ? `+${shapVal}` : shapVal}
                            </span>
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">SHAP Impact</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};