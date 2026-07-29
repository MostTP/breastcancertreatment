import { useCallback } from 'react'
import type { PatientProfile, RecommendResult, PredictResult, ApiError, ModelInfo } from '@/types'

// const API_BASE = 'https://predicting-breast-cancer-t90u.onrender.com'
const API_BASE = 'http://localhost:8000'

function buildPatientPayload(p: PatientProfile) {
  return {
    Age_at_Diagnosis: p.age,
    Tumor_Size: p.tumorSize,
    Tumor_Stage: p.tumorStage,
    Neoplasm_Histologic_Grade: p.grade,
    Lymph_nodes_examined_positive: p.nodes,
    ER_Status: p.er,
    PR_Status: p.pr,
    HER2_Status: p.her2,
    Inferred_Menopausal_State: p.menopausalStatus,
    Chemotherapy: p.chemotherapy,
    Hormone_Therapy: p.hormoneTherapy,
    Radio_Therapy: p.radioTherapy,
  }
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  return res.json()
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function usePrediction() {
  const runPrediction = useCallback(async (profile: PatientProfile): Promise<{ rec: RecommendResult | null; pred: PredictResult | null; err: ApiError | null }> => {
    const payload = buildPatientPayload(profile)
    try {
      const [recResult, predResult] = await Promise.all([
        apiPost<RecommendResult>('/recommend', payload),
        apiPost<PredictResult>('/predict', payload),
      ])
      if (recResult.error) {
        return {
          rec: null,
          pred: null,
          err: {
            code: recResult.error,
            message: recResult.message || 'An error occurred.',
            skipped: recResult.skipped_combinations || [],
          },
        }
      }
      return { rec: recResult, pred: predResult, err: null }
    } catch (err) {
      return {
        rec: null,
        pred: null,
        err: {
          code: 'network_error',
          message: err instanceof Error ? err.message : 'Could not reach the API.',
          skipped: [],
        },
      }
    }
  }, [])

  return { runPrediction }
}

export function useModelInfo() {
  const fetchModelInfo = useCallback(async () => {
    try {
      const data = await apiGet<ModelInfo>('/model-info')
      return { data, error: null }
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }, [])

  return { fetchModelInfo }
}
