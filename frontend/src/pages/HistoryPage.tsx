import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { AnalysisResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { 
  History, 
  Search, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  X, 
  ExternalLink,
  Activity,
  User,
  CreditCard
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResponse[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  const [selectedShapItem, setSelectedShapItem] = useState<AnalysisResponse | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {
    api.get<AnalysisResponse[]>('/analyses/history')
      .then(res => setHistory(res.data))
      .catch(console.error);
  }, []);

  // 🔍 Filtro por Nombre, Cédula, ID, Fecha o Resultado
  const filtered = history.filter(item => {
    const term = search.toLowerCase();
    const dateStr = new Date(item.created_at).toLocaleDateString();
    const patientName = item.patient?.full_name?.toLowerCase() || '';
    const patientCedula = item.patient?.cedula?.toLowerCase() || '';
    const patientId = item.patient_id?.toString().toLowerCase() || '';

    return (
      patientName.includes(term) ||
      patientCedula.includes(term) ||
      patientId.includes(term) ||
      dateStr.includes(term) ||
      item.prediction.toLowerCase().includes(term)
    );
  });

  const modalShapEntries = selectedShapItem 
    ? Object.entries(selectedShapItem.shap_values || {}).filter(([key]) => 
        key.toLowerCase().includes(modalSearch.toLowerCase())
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" /> Historial de Predicciones
        </h1>
        <p className="text-xs text-slate-400">Análisis clínicos realizados ordenados por fecha</p>
      </div>

      <Input
        icon={Search}
        placeholder="Buscar por nombre, cédula, ID paciente, fecha o resultado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const isPositive = item.prediction === 'Positivo';
          const totalShapCount = Object.keys(item.shap_values || {}).length;

          return (
            <Card key={item.id} className="!p-4">
              <div 
                onClick={() => setExpandedId(isExpanded ? null : item.id)} 
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={isPositive ? 'positive' : 'negative'}>
                    {item.prediction}
                  </Badge>
                  <div>
                    {/* Nombre y Cédula del Paciente */}
                    <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      {item.patient?.full_name || 'Paciente Sin Nombre'}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" /> 
                        {item.patient?.cedula || 'N/A'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">ID: {item.patient_id}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    Prob: {(item.probability * 100).toFixed(1)}%
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-slate-400">Impacto SHAP (Top 5)</p>
                      {totalShapCount > 5 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShapItem(item);
                            setModalSearch('');
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                        >
                          Ver todos ({totalShapCount}) <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {Object.entries(item.shap_values || {}).slice(0, 5).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px] font-mono bg-slate-800/40 p-1.5 rounded">
                          <span className="text-slate-300">{k}</span>
                          <span className={v >= 0 ? 'text-rose-400' : 'text-emerald-400'}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 mb-1">Valores de Entrada</p>
                    <div className="grid grid-cols-2 gap-1 max-h-28 overflow-y-auto">
                      {Object.entries(item.input_data || {}).map(([k, v]) => (
                        <div key={k} className="text-[10px] font-mono bg-slate-800/20 p-1 rounded text-slate-400">
                          {k}: <span className="text-slate-200">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* MODAL DE SHAP COMPLETO */}
      {selectedShapItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedShapItem(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-slate-100">
                    Valores SHAP Completos
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Paciente: <span className="font-semibold text-slate-200">{selectedShapItem.patient?.full_name || selectedShapItem.patient_id}</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedShapItem(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800 bg-slate-950/40">
              <Input
                icon={Search}
                placeholder="Filtrar biomarcador por nombre..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="!py-1.5 text-xs"
              />
            </div>

            <div className="p-4 overflow-y-auto space-y-1.5 flex-1 divide-y divide-slate-800/40">
              {modalShapEntries.length > 0 ? (
                modalShapEntries.map(([k, v]) => (
                  <div 
                    key={k} 
                    className="flex justify-between items-center text-xs font-mono pt-1.5 first:pt-0 hover:bg-slate-800/30 p-1.5 rounded transition-colors"
                  >
                    <span className="text-slate-300">{k}</span>
                    <span className={`font-semibold ${v >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {v > 0 ? `+${v}` : v}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No se encontraron biomarcadores con ese criterio.
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center text-xs text-slate-400">
              <span>
                Mostrando <strong className="text-slate-200">{modalShapEntries.length}</strong> de {Object.keys(selectedShapItem.shap_values || {}).length} biomarcadores
              </span>
              <button
                onClick={() => setSelectedShapItem(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};