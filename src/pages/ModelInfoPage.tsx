import { useEffect } from 'react'
import { useAppStore } from '@/hooks/useStore'
import { useModelInfo } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, Loader2, CircleX, ShieldCheck } from 'lucide-react'
import { cn, escHtml } from '@/lib/utils'
import type { ModelInfo } from '@/types'

function StatCard({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div className="bg-bg-warm rounded-xl p-4 text-center stat-card">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className="font-serif text-2xl font-bold text-primary">{value}</div>
    </div>
  )
}

function ModelContent({ info }: { info: ModelInfo }) {
  const meta = info.model_metadata || {}
  const metrics = info.metrics || {}
  const disc = info.disclaimer || {}
  const testM = metrics.test_metrics || {}
  const cm = testM.confusion_matrix || { true_positive: '', true_negative: '', false_positive: '', false_negative: '' }
  const gridSearch = metrics.grid_search || {}

  return (
    <div className="animate-page-transition max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4 bg-primary-light text-primary border-primary/20">
          <Bot className="w-3.5 h-3.5 mr-1.5" />
          Model info
        </Badge>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-3">
          Model information &amp; metrics
        </h1>
        <p className="text-text-secondary text-lg">
          Live data from <code className="bg-primary-light text-primary px-2 py-0.5 rounded text-sm">GET /model-info</code>
        </p>
      </div>

      {/* Identity */}
      <Card className="mb-6">
        <CardContent className="p-6 md:p-8">
          <h3 className="font-serif text-xl font-bold text-text-primary mb-5">Model identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Name', meta.model_name],
              ['Family', meta.model_family],
              ['Target', meta.target_name],
              ['Threshold', meta.threshold],
              ['Causal status', meta.causal_status],
              ['Calibration', meta.probability_status],
              ['Trained at', meta.trained_at ? new Date(meta.trained_at).toLocaleString() : '—'],
              ['Dataset rows', metrics.dataset_rows],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-1">
                <div className="text-xs text-text-muted uppercase tracking-wider">{k}</div>
                <div className="text-sm font-medium text-text-primary">{escHtml(String(v ?? '—'))}</div>
              </div>
            ))}
          </div>
          {meta.target_definition && (
            <div className="mt-5 p-4 rounded-xl bg-primary-light text-sm text-text-secondary">
              <strong className="text-primary">Target definition:</strong> {escHtml(meta.target_definition)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test metrics */}
      {testM.roc_auc !== undefined && (
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-text-primary mb-5">Test set metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                ['ROC AUC', testM.roc_auc ? (testM.roc_auc * 100).toFixed(1) + '%' : '—'],
                ['PR AUC', testM.pr_auc ? (testM.pr_auc * 100).toFixed(1) + '%' : '—'],
                ['F1 Score', testM.f1 ? (testM.f1 * 100).toFixed(1) + '%' : '—'],
                ['Brier Score', testM.brier_score?.toFixed(4) ?? '—'],
                ['Accuracy', testM.accuracy ? (testM.accuracy * 100).toFixed(1) + '%' : '—'],
                ['Precision', testM.precision ? (testM.precision * 100).toFixed(1) + '%' : '—'],
                ['Recall', testM.recall ? (testM.recall * 100).toFixed(1) + '%' : '—'],
                ['Threshold', testM.threshold ?? '—'],
              ].map(([k, v]) => (
                <StatCard key={k} label={k} value={v} />
              ))}
            </div>

            {cm.true_positive !== undefined && (
              <>
                <h4 className="font-semibold text-text-primary mb-3">Confusion matrix</h4>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[
                    ['True Negative', cm.true_negative, 'text-green-600'],
                    ['False Positive', cm.false_positive, 'text-red-600'],
                    ['False Negative', cm.false_negative, 'text-red-600'],
                    ['True Positive', cm.true_positive, 'text-green-600'],
                  ].map(([label, val, color]) => (
                    <div key={label} className="rounded-xl border border-border-light p-3 text-center">
                      <div className="text-xs text-text-muted mb-1">{label}</div>
                      <div className={cn("font-serif text-xl font-bold", color)}>{val}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grid search */}
      {gridSearch.best_params && (
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-text-primary mb-4">Grid search results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-bg-warm rounded-xl p-4">
                <div className="text-xs text-text-muted mb-1">Best CV ROC AUC</div>
                <div className="font-serif text-2xl font-bold text-primary">
                  {gridSearch.best_cv_roc_auc ? (gridSearch.best_cv_roc_auc * 100).toFixed(1) + '%' : '—'}
                </div>
              </div>
              {Object.entries(gridSearch.best_params).map(([k, v]) => (
                <div key={k} className="bg-bg-warm rounded-xl p-4">
                  <div className="text-xs text-text-muted mb-1">{k}</div>
                  <div className="font-serif text-2xl font-bold text-primary">{String(v)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features */}
      {meta.features && (
        <Card className="mb-6">
          <CardContent className="p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-text-primary mb-4">
              Model features ({meta.features.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {meta.features.map(f => (
                <span
                  key={f}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border",
                    (meta.numeric_features || []).includes(f)
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-primary-light border-border-light text-primary"
                  )}
                >
                  {escHtml(f)}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-text-muted">
              <span><span className="inline-block w-3 h-3 rounded-full bg-blue-200 mr-1" />Numeric</span>
              <span><span className="inline-block w-3 h-3 rounded-full bg-primary-light border border-border-light mr-1" />Categorical</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {disc.statements && (
        <Card>
          <CardContent className="p-6 md:p-8">
            <h3 className="font-serif text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {escHtml(disc.title || 'Disclaimer')}
            </h3>
            <ul className="space-y-2">
              {disc.statements.map((s, i) => (
                <li key={i} className="text-sm text-text-secondary flex gap-2">
                  <span className="text-primary flex-shrink-0">•</span>
                  {escHtml(s)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function ModelInfoPage() {
  const { state, setModelInfo } = useAppStore()
  const { fetchModelInfo } = useModelInfo()

  useEffect(() => {
    if (!state.modelInfo && !state.modelInfoLoading) {
      setModelInfo(null, null, true)
      fetchModelInfo().then(({ data, error }) => {
        setModelInfo(data, error, false)
      })
    }
  }, [])

  if (state.modelInfoLoading) {
    return (
      <div className="animate-page-transition max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-9 h-9 animate-spin text-primary mx-auto mb-4" />
        <p className="text-text-secondary">Loading model info…</p>
      </div>
    )
  }

  if (state.modelInfoError) {
    return (
      <div className="animate-page-transition max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-2xl border error-card p-6 flex items-start gap-3">
          <CircleX className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold mb-1">Could not load model info</div>
            <div className="text-sm text-text-secondary">{escHtml(state.modelInfoError)}</div>
            <div className="text-xs text-text-muted mt-2">
              Is the FastAPI server running at <code>https://predicting-breast-cancer-t90u.onrender.com</code>?
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!state.modelInfo) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-text-muted">No data.</div>
  }

  return <ModelContent info={state.modelInfo} />
}
