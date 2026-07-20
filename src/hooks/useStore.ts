import { useState, useCallback } from 'react'
import type { PatientProfile, RecommendResult, PredictResult, ApiError, ModelInfo, TabId, PageId } from '@/types'

const defaultProfile: PatientProfile = {
  age: 52,
  menopausalStatus: 'Post',
  tumorStage: 2,
  grade: 2,
  tumorSize: 22,
  nodes: 1,
  er: 'Positive',
  pr: 'Positive',
  her2: 'Negative',
  chemotherapy: 'No',
  hormoneTherapy: 'No',
  radioTherapy: 'No',
}

export interface AppState {
  currentPage: PageId
  patientProfile: PatientProfile
  recommendResult: RecommendResult | null
  predictResult: PredictResult | null
  isPredicting: boolean
  apiError: ApiError | null
  modelInfo: ModelInfo | null
  modelInfoLoading: boolean
  modelInfoError: string | null
  activeTab: TabId
}

const initialState: AppState = {
  currentPage: 'home',
  patientProfile: { ...defaultProfile },
  recommendResult: null,
  predictResult: null,
  isPredicting: false,
  apiError: null,
  modelInfo: null,
  modelInfoLoading: false,
  modelInfoError: null,
  activeTab: 'clinical',
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(initialState)

  const setField = useCallback((field: keyof PatientProfile, value: PatientProfile[keyof PatientProfile]) => {
    setState(prev => ({
      ...prev,
      patientProfile: { ...prev.patientProfile, [field]: value },
      recommendResult: null,
      predictResult: null,
      apiError: null,
    }))
  }, [])

  const setPage = useCallback((page: PageId) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])

  const setTab = useCallback((tab: TabId) => {
    setState(prev => ({ ...prev, activeTab: tab }))
  }, [])

  const setPredicting = useCallback((val: boolean) => {
    setState(prev => ({ ...prev, isPredicting: val }))
  }, [])

  const setResults = useCallback((rec: RecommendResult | null, pred: PredictResult | null, err: ApiError | null) => {
    setState(prev => ({
      ...prev,
      recommendResult: rec,
      predictResult: pred,
      apiError: err,
      isPredicting: false,
    }))
  }, [])

  const setModelInfo = useCallback((info: ModelInfo | null, error: string | null, loading: boolean) => {
    setState(prev => ({
      ...prev,
      modelInfo: info,
      modelInfoError: error,
      modelInfoLoading: loading,
    }))
  }, [])

  const loadPreset = useCallback((type: 'luminalA' | 'her2' | 'triple') => {
    const presets: Record<string, PatientProfile> = {
      luminalA: {
        age: 65, menopausalStatus: 'Post', tumorStage: 1, grade: 1,
        tumorSize: 12, nodes: 0,
        er: 'Positive', pr: 'Positive', her2: 'Negative',
        chemotherapy: 'No', hormoneTherapy: 'Yes', radioTherapy: 'No',
      },
      her2: {
        age: 45, menopausalStatus: 'Pre', tumorStage: 2, grade: 3,
        tumorSize: 28, nodes: 2,
        er: 'Negative', pr: 'Negative', her2: 'Positive',
        chemotherapy: 'Yes', hormoneTherapy: 'No', radioTherapy: 'Yes',
      },
      triple: {
        age: 55, menopausalStatus: 'Post', tumorStage: 3, grade: 3,
        tumorSize: 35, nodes: 3,
        er: 'Negative', pr: 'Negative', her2: 'Negative',
        chemotherapy: 'Yes', hormoneTherapy: 'No', radioTherapy: 'Yes',
      },
    }
    setState(prev => ({
      ...prev,
      patientProfile: { ...presets[type] },
      recommendResult: null,
      predictResult: null,
      apiError: null,
      activeTab: 'clinical',
    }))
  }, [])

  const resetProfile = useCallback(() => {
    setState(prev => ({
      ...prev,
      patientProfile: { ...defaultProfile },
      recommendResult: null,
      predictResult: null,
      apiError: null,
      activeTab: 'clinical',
    }))
  }, [])

  return {
    state,
    setField,
    setPage,
    setTab,
    setPredicting,
    setResults,
    setModelInfo,
    loadPreset,
    resetProfile,
  }
}
