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

export interface PatientShort {
  id: string;
  cedula: string;
  full_name: string;
}

export interface AnalysisResponse {
  id: number;
  patient_id: string;
  doctor_id: number;
  patient?: PatientShort; 
  input_data: Record<string, number>;
  prediction: string;
  probability: number;
  top_biomarkers?: Record<string, number>;
  all_biomarkers?: Record<string, number>;
  shap_values: Record<string, number>;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}