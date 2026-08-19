import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { AnalysisResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  History,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User,
  CreditCard
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';

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
        <h1 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" /> Historial de Predicciones
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">Análisis clínicos realizados en la plataforma ordenados por fecha</p>
      </div>

      <Input
        icon={Search}
        placeholder="Buscar por paciente, cédula, fecha o dictamen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-3">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id;
          const totalShapCount = Object.keys(item.shap_values || {}).length;

          return (
            <Card key={item.id} className="!p-4">
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={item.prediction === 'Positivo' ? 'danger' : 'success'}>
                    {item.prediction}
                  </Badge>
                  <div>
                    <p className="text-xs font-semibold text-gray-100 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      {item.patient?.full_name || 'Paciente Sin Nombre'}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-gray-500" />
                        {item.patient?.cedula || 'N/A'}
                      </span>
                      <span>•</span>
                      <span className="text-gray-500">ID: {item.patient_id}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                      <Calendar className="w-3 h-3 text-gray-400" /> {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-gray-200">
                      {(item.probability * 100).toFixed(1)}%
                    </span>
                    <p className="text-[9px] text-gray-400 font-mono">Probabilidad</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Top 5 SHAP */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Impacto SHAP (Top 5)</p>
                      {totalShapCount > 5 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShapItem(item);
                            setModalSearch('');
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Ver todos ({totalShapCount}) <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {Object.entries(item.shap_values || {}).slice(0, 5).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-[11px] font-mono bg-gray-950 p-2 rounded-lg border border-gray-800/80">
                          <span className="text-gray-300">{k}</span>
                          <span className={`font-semibold ${Number(v) >= 0 ? 'text-rose-400' : 'text-blue-400'}`}>
                            {Number(v) > 0 ? `+${v}` : v}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Valores de Entrada */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Valores Ingresados</p>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {Object.entries(item.input_data || {}).map(([k, v]) => (
                        <div key={k} className="text-[10px] font-mono bg-gray-950 p-1.5 rounded-lg border border-gray-800/80 text-gray-400 flex justify-between">
                          <span className="truncate">{k}:</span>
                          <span className="text-gray-200 font-bold ml-1">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-xs">
            No se encontraron análisis que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* MODAL DE SHAP COMPLETO */}
      <Modal
        isOpen={!!selectedShapItem}
        onClose={() => setSelectedShapItem(null)}
        title="Valores SHAP Completos"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Subtítulo con información del paciente */}
          <p className="text-xs text-slate-500 dark:text-gray-400 -mt-2">
            Paciente: <span className="font-semibold text-slate-800 dark:text-gray-200">{selectedShapItem?.patient?.full_name || selectedShapItem?.patient_id}</span>
          </p>

          {/* Buscador de Biomarcadores */}
          <Input
            icon={Search}
            placeholder="Filtrar biomarcador por nombre..."
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            className="!py-1.5 text-xs"
          />

          {/* Lista con scroll interno */}
          <div className="max-h-[50vh] overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-gray-800/40 pr-1">
            {modalShapEntries.length > 0 ? (
              modalShapEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between items-center text-xs font-mono pt-2 first:pt-0 hover:bg-slate-100 dark:hover:bg-gray-800/30 p-2 rounded-lg transition-colors"
                >
                  <span className="text-slate-700 dark:text-gray-300">{k}</span>
                  <span className={`font-semibold ${Number(v) >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {Number(v) > 0 ? `+${v}` : v}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 dark:text-gray-400 text-xs">
                No se encontraron biomarcadores.
              </div>
            )}
          </div>

          {/* Pie del modal con resumen y botón de cierre */}
          <div className="pt-3 border-t border-slate-200 dark:border-gray-800 flex justify-between items-center text-xs text-slate-500 dark:text-gray-400">
            <span>
              Mostrando <strong className="text-slate-800 dark:text-gray-200">{modalShapEntries.length}</strong> de {Object.keys(selectedShapItem?.shap_values || {}).length} variables
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedShapItem(null)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};