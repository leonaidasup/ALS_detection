import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { AnalysisResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { History, Search, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<AnalysisResponse[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    api.get<AnalysisResponse[]>('/analysis/history').then(res => setHistory(res.data)).catch(console.error);
  }, []);

  const filtered = history.filter(item => {
    const term = search.toLowerCase();
    const dateStr = new Date(item.created_at).toLocaleDateString();
    return (
      item.patient_id.toString().includes(term) ||
      dateStr.includes(term) ||
      item.prediction.toLowerCase().includes(term)
    );
  });

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
        placeholder="Buscar por ID paciente, fecha o resultado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const isPositive = item.prediction === 'Positivo';

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
                    <p className="text-xs font-semibold text-slate-200">ID Paciente: {item.patient_id}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
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
                    <p className="text-[10px] font-semibold text-slate-400 mb-1">Impacto SHAP</p>
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
    </div>
  );
};