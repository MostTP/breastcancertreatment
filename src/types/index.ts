export interface PatientProfile {
  age: number
  menopausalStatus: 'Pre' | 'Post'
  tumorStage: 1 | 2 | 3 | 4
  grade: 1 | 2 | 3
  tumorSize: number
  nodes: number
  er: 'Positive' | 'Negative'
  pr: 'Positive' | 'Negative'
  her2: 'Positive' | 'Negative'
  chemotherapy: 'Yes' | 'No'
  hormoneTherapy: 'Yes' | 'No'
  radioTherapy: 'Yes' | 'No'
}

export interface TreatmentOption {
  Chemotherapy: 'Yes' | 'No'
  Hormone_Therapy: 'Yes' | 'No'
  Radio_Therapy: 'Yes' | 'No'
  estimated_outcome_probability: number
  estimated_treatment_effect_vs_no_treatment?: number
  is_current_treatment?: boolean
  rank?: number
  explanation?: {
    features: ShapFeature[]
  }
}

export interface ShapFeature {
  feature: string
  impact: number
}

export interface SkippedCombination {
  Chemotherapy: 'Yes' | 'No'
  Hormone_Therapy: 'Yes' | 'No'
  Radio_Therapy: 'Yes' | 'No'
  reason?: string
}

export interface ConfidenceInfo {
  level: 'higher' | 'moderate' | 'low'
  reason?: string
}

export interface Disclaimer {
  title?: string
  statements?: string[]
}

export interface RecommendResult {
  recommended_treatment?: TreatmentOption
  best_treatment?: TreatmentOption
  ranked_treatment_options?: TreatmentOption[]
  all_options?: TreatmentOption[]
  current_treatment?: TreatmentOption
  current_treatment_probability?: number
  baseline_treatment?: { estimated_outcome_probability: number }
  recommended_treatment_improvement_over_current?: number
  confidence?: ConfidenceInfo
  skipped_combinations?: SkippedCombination[]
  warnings?: string[]
  disclaimer?: Disclaimer
  error?: string
  message?: string
}

export interface PredictResult {
  estimated_outcome_probability: number
  threshold: number
}

export interface ApiError {
  code: string
  message: string
  skipped: SkippedCombination[]
}

export interface ModelMetadata {
  model_name?: string
  model_family?: string
  target_name?: string
  threshold?: number
  causal_status?: string
  probability_status?: string
  trained_at?: string
  target_definition?: string
  features?: string[]
  numeric_features?: string[]
}

export interface TestMetrics {
  roc_auc?: number
  pr_auc?: number
  f1?: number
  brier_score?: number
  accuracy?: number
  precision?: number
  recall?: number
  threshold?: number
  confusion_matrix?: {
    true_positive: number
    true_negative: number
    false_positive: number
    false_negative: number
  }
}

export interface GridSearchResult {
  best_cv_roc_auc?: number
  best_params?: Record<string, string | number>
}

export interface ModelMetrics {
  dataset_rows?: number
  test_metrics?: TestMetrics
  grid_search?: GridSearchResult
}

export interface ModelInfo {
  model_metadata: ModelMetadata
  metrics: ModelMetrics
  disclaimer?: Disclaimer
}

export type TabId = 'clinical' | 'tumor' | 'biomarkers' | 'treatment'
export type PageId = 'home' | 'predictor' | 'model' | 'about'
