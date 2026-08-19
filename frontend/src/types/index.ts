// src/types/index.ts
export interface User {
  id: string;
  email: string;
  full_name: string;
  cedula: string;
  is_active: boolean;
}

export interface Patient {
  id: number;
  full_name: string;
  cedula: string;
  year_old: number;
  doctor_id: string;
}

export type BiomarkersDict = Record<string, number>;

export interface AnalysisCreate {
  patient_id: number;
  biomarkers: BiomarkersDict;
}

export interface AnalysisResponse {
  id: number;
  patient_id: number;
  doctor_id: string;
  prediction: 'Positivo' | 'Negativo';
  probability: number;
  input_data: BiomarkersDict;
  shap_values: Record<string, number>;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}