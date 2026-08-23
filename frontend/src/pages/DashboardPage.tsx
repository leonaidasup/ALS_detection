import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Patient, AnalysisResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { 
  Search, Play, UserCheck, Activity, 
  ListFilter, BarChart2, 
  TestTube2, Loader2, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  Upload
} from 'lucide-react';

export const DashboardPage: React.FC<{ prefilledCedula?: string }> = ({ prefilledCedula }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState(prefilledCedula || '');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [requiredBiomarkers, setRequiredBiomarkers] = useState<string[]>([]);
  const [loadingBiomarkers, setLoadingBiomarkers] = useState<boolean>(true);
  const [biomarkerFilter, setBiomarkerFilter] = useState('');
  const [biomarkerValues, setBiomarkerValues] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [showAllShap, setShowAllShap] = useState(false);

  useEffect(() => {
    api.get<Patient[]>('/patients/')
      .then(res => setPatients(res.data))
      .catch(console.error);

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

  const handleQuickFill = () => {
    const mockData: Record<string, string> = {};
    requiredBiomarkers.forEach(key => {
      mockData[key] = (Math.random() * 18 + 1).toFixed(3); // modificar para random
    });
    setBiomarkerValues(mockData);
  };

  const handleLoadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setBiomarkerValues(json);
        setError('');
      } catch (err) {
        setError('Archivo JSON invalido');
      }
    };
    reader.readAsText(file);
  };

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return setError('Selecciona un paciente antes de continuar');

    setLoading(true);
    setError('');

    const numericBiomarkers: Record<string, number> = {};
    requiredBiomarkers.forEach(key => {
      const parsed = parseFloat(biomarkerValues[key]);
      numericBiomarkers[key] = isNaN(parsed) ? 0.0 : parsed;
    });

    try {
      const response = await api.post<AnalysisResponse>('/analyses/', {
        patient_id: selectedPatient.id,
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Columna Izquierda: Selección de Paciente e ingreso de biomarcadores */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Busqueda del Paciente */}
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" /> Seleccion de Paciente
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
                <div className="max-h-40 overflow-y-auto bg-gray-950 border border-gray-800 rounded-xl divide-y divide-gray-800/60 shadow-xl">
                  {filteredPatients.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => { setSelectedPatient(p); setPatientSearch(p.cedula); }}
                      className="p-3 hover:bg-gray-800/60 cursor-pointer text-xs flex justify-between items-center transition-colors"
                    >
                      <span className="font-medium text-gray-200">{p.full_name}</span>
                      <span className="text-gray-400 font-mono">CC: {p.cedula}</span>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && (
                    <p className="p-3 text-xs text-gray-500 text-center">No se encontraron pacientes</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-100">{selectedPatient.full_name}</p>
                  <p className="text-xs text-gray-400 font-mono">CC: {selectedPatient.cedula} · {selectedPatient.year_old} años</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPatient(null)} 
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-rose-500/10"
              >
                Cambiar
              </button>
            </div>
          )}
        </Card>

        {/* Captura biomarcadores */}
        <form onSubmit={handleRunInference}>
          <Card className="space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-gray-800">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <TestTube2 className="w-4 h-4 text-blue-400" /> Ingresa Biomarcadores
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Variables requeridas por el modelo ML ({requiredBiomarkers.length})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickFill}
                  disabled={loadingBiomarkers}
                  className="px-2.5 py-1.5 bg-gray-950 hover:bg-gray-800 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Datos de Ejemplo</span>
                </button>

                <button
                  onClick={() => document.getElementById('json-upload')?.click()}
                  disabled={loadingBiomarkers}
                  className="px-2.5 py-1.5 bg-gray-950 hover:bg-gray-800 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cargar datos</span>
                </button>

                <input
                  id="json-upload"
                  type="file"
                  accept=".json"
                  onChange={handleLoadJSON}
                  className="hidden"
                />

                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={biomarkerFilter}
                  onChange={(e) => setBiomarkerFilter(e.target.value)}
                  className="bg-gray-950 border border-gray-800 text-xs text-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 w-28"
                />
              </div>
            </div>

            {loadingBiomarkers ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin text-blue-500 mb-3" />
                <p className="text-xs font-medium text-gray-300">Cargando variables del modelo...</p>
                <p className="text-[11px] text-gray-500 mt-1">Leyendo estructura PKL desde el backend</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {visibleBiomarkers.map((key) => {
                  const isFilled = biomarkerValues[key] !== undefined && biomarkerValues[key] !== '';

                  return (
                    <div 
                      key={key} 
                      className={`p-2.5 rounded-xl border transition-all ${
                        isFilled 
                          ? 'bg-blue-950/20 border-blue-500/40' 
                          : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-gray-300 flex items-center gap-1">
                          {formatLabel(key)}
                        </label>
                        <span className="text-[9px] font-mono text-gray-500 uppercase">{key}</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        required
                        value={biomarkerValues[key] ?? ''}
                        onChange={(e) => setBiomarkerValues({ ...biomarkerValues, [key]: e.target.value })}
                        placeholder="0.00"
                        className={`w-full bg-gray-900 border text-gray-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono ${
                          isFilled ? 'border-blue-500/50 focus:border-blue-400' : 'border-gray-700/80 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Error en el análisis</h4>
                  <p className="text-xs text-rose-400 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading || loadingBiomarkers} size="lg" className="w-full mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {loading ? 'Analizando muestra...' : 'Ejecutar Análisis Diagnóstico'}
            </Button>
          </Card>
        </form>
      </div>

      {/* Resultado y explicabilidad con SHAP */}
      <div className="lg:col-span-5">
        <Card className="h-full flex flex-col justify-start">
          {!result ? (
            <div className="text-center py-20 my-auto">
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-full inline-block mb-3">
                <Activity className="w-8 h-8 text-gray-600 animate-pulse" />
              </div>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Selecciona un paciente, ingresa los biomarcadores requeridos y ejecuta la inferencia para obtener el diagnóstico.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Dictamen Diagnóstico */}
              <div className="text-center pb-5 border-b border-gray-800">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" /> Dictamen Diagnóstico ML
                </span>

                {/* Tarjeta de Métricas Directas */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800 text-left">
                    <p className="text-[10px] font-mono text-gray-400 uppercase">Resultado</p>
                    <p className={`text-base font-bold mt-0.5 ${
                      result.prediction === 'Positivo' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {result.prediction}
                    </p>
                  </div>
                  <div className="bg-gray-950/60 p-3 rounded-xl border border-gray-800 text-left">
                    <p className="text-[10px] font-mono text-gray-400 uppercase">Probabilidad</p>
                    <p className="text-base font-bold text-gray-100 font-mono mt-0.5">
                      {(result.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Biomarcadores e Impacto SHAP */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-blue-400" /> Impacto SHAP por Variable
                  </h3>
                  <button
                    onClick={() => setShowAllShap(!showAllShap)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ListFilter className="w-3 h-3" />
                    {showAllShap ? 'Ver Top 5' : 'Ver Todos'}
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {Object.entries(result.shap_values || {})
                    .slice(0, showAllShap ? undefined : 5)
                    .map(([bio, shapVal]) => {
                      const inputValue = result.input_data?.[bio];
                      const isPositiveImpact = Number(shapVal) >= 0;

                      return (
                        <div key={bio} className="bg-gray-950/60 p-3 rounded-xl border border-gray-800/80 flex items-center justify-between hover:border-gray-700 transition-colors">
                          <div>
                            <p className="font-semibold text-gray-200 text-xs">{formatLabel(bio)}</p>
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                              Valor medido: <span className="text-blue-400 font-bold">{inputValue ?? 'N/A'}</span>
                            </p>
                          </div>

                          <div className="text-right font-mono">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isPositiveImpact ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {Number(shapVal) > 0 ? `+${shapVal}` : shapVal}
                            </span>
                            <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-wider">SHAP Impact</p>
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