import { useRef, useCallback } from 'react'
import { useAppStore } from '@/hooks/useStore'
import { usePrediction } from '@/hooks/useApi'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
  Wand2, RotateCcw, UserRound, AlertTriangle,
  CircleCheck, CircleAlert, ArrowRight,
  Loader2, ShieldCheck, Stethoscope, Dna, Pill, Activity
} from 'lucide-react'
import { cn, escHtml } from '@/lib/utils'
import type { PatientProfile, TreatmentOption, RecommendResult, PredictResult } from '@/types'

const STAGE_LABELS = ['I', 'II', 'III', 'IV']

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "option-btn py-3 px-4 rounded-xl border text-sm font-medium w-full transition-all",
        active
          ? "active bg-primary text-white border-primary shadow-sm"
          : "bg-white text-text-secondary border-border-default hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      {children}
    </button>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  displayValue,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  displayValue: string
  onChange: (val: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-3">
        {label}: <span className="text-primary font-semibold">{displayValue}</span>
      </label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-text-muted ml-10">{subtitle}</p>}
    </div>
  )
}

function TreatmentBadges({ opt, small = false }: { opt: TreatmentOption; small?: boolean }) {
  const items = [
    { label: small ? 'Chemo' : 'Chemotherapy', on: opt.Chemotherapy === 'Yes' },
    { label: small ? 'Hormone' : 'Hormone Therapy', on: opt.Hormone_Therapy === 'Yes' },
    { label: small ? 'Radio' : 'Radio Therapy', on: opt.Radio_Therapy === 'Yes' },
  ]
  if (small) {
    return (
      <>
        {items.map(({ label, on }) => (
          <span
            key={label}
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              on ? "bg-primary/10 text-primary" : "bg-gray-100 text-text-muted"
            )}
          >
            {on ? '✓' : '✗'} {label}
          </span>
        ))}
      </>
    )
  }
  return (
    <>
      {items.map(({ label, on }) => (
        <span
          key={label}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
            on ? "bg-primary text-white" : "bg-gray-100 text-text-muted line-through"
          )}
        >
          {on ? <CircleCheck className="w-3 h-3" /> : <CircleAlert className="w-3 h-3" />}
          {label}
        </span>
      ))}
    </>
  )
}

function ComparisonStrip({ rec }: { rec: RecommendResult }) {
  const current = rec.current_treatment
  const baseline = rec.baseline_treatment
  const top = rec.recommended_treatment || rec.best_treatment

  const fmtProb = (v: number | null | undefined) =>
    v !== null && v !== undefined ? (v * 100).toFixed(1) + '%' : '—'
  const fmtTx = (t?: TreatmentOption) => {
    if (!t) return '—'
    const parts: string[] = []
    if (t.Chemotherapy === 'Yes') parts.push('Chemo')
    if (t.Hormone_Therapy === 'Yes') parts.push('Hormone')
    if (t.Radio_Therapy === 'Yes') parts.push('Radio')
    return parts.join(' ') || 'No treatment'
  }

  const items = [
    { label: 'No treatment', val: fmtProb(baseline?.estimated_outcome_probability), color: 'text-text-secondary', border: 'border-border-default', sub: '' },
    { label: 'Current treatment', val: fmtProb(rec.current_treatment_probability), color: 'text-warning', border: 'border-warning/40', sub: fmtTx(current) },
    { label: 'Recommended', val: fmtProb(top?.estimated_outcome_probability), color: 'text-primary', border: 'border-primary/40', sub: top ? fmtTx(top) : '' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, val, color, border, sub }) => (
        <div key={label} className={cn("bg-white rounded-xl border p-4 text-center", border)}>
          <div className="text-xs text-text-muted mb-1">{label}</div>
          <div className={cn("font-serif text-2xl font-bold", color)}>{val}</div>
          {sub && <div className="text-xs text-text-muted mt-1 truncate">{sub}</div>}
        </div>
      ))}
    </div>
  )
}

function ResultsSection({ rec, pred }: { rec: RecommendResult; pred: PredictResult | null }) {
  const top = rec.recommended_treatment || rec.best_treatment
  const ranked = rec.ranked_treatment_options || rec.all_options || []
  const confidence = rec.confidence
  const skipped = rec.skipped_combinations || []
  const warnings = rec.warnings || []
  const disclaimer = rec.disclaimer

  const shapFeatures = top?.explanation?.features || []
  const maxImpact = shapFeatures.length ? Math.max(...shapFeatures.map(f => Math.abs(f.impact))) : 1

  const confidenceClass =
    confidence?.level === 'higher' ? 'confidence-higher'
      : confidence?.level === 'moderate' ? 'confidence-moderate'
        : 'confidence-low'

  const confidenceIcon =
    confidence?.level === 'higher' ? <CircleCheck className="w-4 h-4" />
      : confidence?.level === 'moderate' ? <CircleAlert className="w-4 h-4" />
        : <CircleAlert className="w-4 h-4" />

  return (
    <div className="animate-result-appear space-y-6">
      {/* Probability + Confidence */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider mb-2">SVM Model Score</div>
              <div className="font-serif text-5xl font-bold text-primary">
                {pred ? (pred.estimated_outcome_probability * 100).toFixed(1) : '—'}
                <span className="text-2xl text-text-secondary">%</span>
              </div>
              <div className="text-sm text-text-secondary mt-1">
                Estimated outcome probability (threshold: {pred ? pred.threshold : '0.3'})
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              {confidence?.level && (
                <>
                  <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium", confidenceClass)}>
                    {confidenceIcon}
                    {confidence.level.charAt(0).toUpperCase() + confidence.level.slice(1)} confidence
                  </div>
                  {confidence.reason && (
                    <div className="text-xs text-text-muted text-right max-w-48">{confidence.reason}</div>
                  )}
                </>
              )}
            </div>
          </div>
          {pred && (
            <>
              <Progress value={pred.estimated_outcome_probability * 100} className="h-2.5" />
              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>0%</span><span>100%</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Comparison Strip */}
      <ComparisonStrip rec={rec} />

      {/* Recommended treatment */}
      {top && (
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-3">Top recommended treatment</div>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div className="flex flex-wrap gap-2">
                <TreatmentBadges opt={top} />
              </div>
              <div className="text-right">
                <div className="font-serif text-3xl font-bold text-primary">
                  {(top.estimated_outcome_probability * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted">estimated probability</div>
              </div>
            </div>
            {rec.recommended_treatment_improvement_over_current !== null &&
              rec.recommended_treatment_improvement_over_current !== undefined && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
                  <ArrowRight className="w-4 h-4 inline mr-2" />
                  {(rec.recommended_treatment_improvement_over_current * 100).toFixed(1)}% improvement over current treatment
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* All ranked options */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <h3 className="font-serif text-2xl font-bold text-text-primary mb-2">All ranked treatment options</h3>
          <p className="text-text-secondary text-sm mb-6">
            {ranked.length} clinically plausible combination{ranked.length !== 1 ? 's' : ''} scored · {skipped.length} filtered out
          </p>
          <div className="space-y-3">
            {ranked.map((opt, i) => {
              const isCurrent = opt.is_current_treatment
              const isTop = i === 0
              return (
                <div
                  key={i}
                  className={cn(
                    "treatment-card rounded-xl border border-border-light p-4",
                    isTop && "top-card"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                        isTop ? "bg-primary text-white" : "bg-primary-light text-primary"
                      )}>
                        {opt.rank || i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-1 mb-1">
                          <TreatmentBadges opt={opt} small />
                        </div>
                        {isCurrent && (
                          <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                            Current treatment
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={cn("font-serif text-xl font-bold", isTop ? "text-primary" : "text-text-primary")}>
                        {(opt.estimated_outcome_probability * 100).toFixed(1)}%
                      </div>
                      {opt.estimated_treatment_effect_vs_no_treatment !== undefined && (
                        <div className={cn(
                          "text-xs",
                          opt.estimated_treatment_effect_vs_no_treatment >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {opt.estimated_treatment_effect_vs_no_treatment >= 0 ? '+' : ''}
                          {(opt.estimated_treatment_effect_vs_no_treatment * 100).toFixed(1)}% vs no tx
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress
                      value={opt.estimated_outcome_probability * 100}
                      className={cn("h-1.5", isTop ? "bg-primary/20" : "bg-gray-100")}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skipped */}
      {skipped.length > 0 && (
        <div className="rounded-2xl border skipped-card p-5">
          <div className="flex items-center gap-2 mb-3 font-medium text-text-primary">
            <AlertTriangle className="w-4 h-4 text-warning" />
            {skipped.length} combination{skipped.length !== 1 ? 's' : ''} filtered by clinical guardrails
          </div>
          <ul className="space-y-1 text-sm text-text-secondary">
            {skipped.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex-shrink-0 text-warning">—</span>
                <span>
                  <strong>Chemo:</strong> {s.Chemotherapy} · <strong>Hormone:</strong> {s.Hormone_Therapy} · <strong>Radio:</strong> {s.Radio_Therapy}
                  {s.reason && <><br /><span className="text-text-muted">{escHtml(s.reason)}</span></>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SHAP */}
      {shapFeatures.length > 0 && (
        <Card>
          <CardContent className="p-6 md:p-8">
            <h3 className="font-serif text-2xl font-bold text-text-primary mb-2">Feature attributions (SHAP)</h3>
            <p className="text-text-secondary text-sm mb-6">
              For the top recommended treatment. Positive impact → pushes toward favourable outcome. Negative → away from it.
            </p>
            <div className="space-y-3">
              {[...shapFeatures]
                .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                .map((f, i) => {
                  const pct = (Math.abs(f.impact) / maxImpact * 100).toFixed(1)
                  const isPos = f.impact >= 0
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">{escHtml(f.feature)}</span>
                        <span className={cn("font-medium", isPos ? "text-primary" : "text-red-500")}>
                          {isPos ? '+' : ''}{f.impact.toFixed(4)}
                        </span>
                      </div>
                      <div className={cn("h-2 bg-gray-100 rounded-full overflow-hidden flex", isPos ? "" : "justify-end")}>
                        <div
                          className={cn("h-full progress-bar", isPos ? "shap-bar-pos" : "shap-bar-neg")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings & Disclaimer */}
      {(warnings.length > 0 || (disclaimer?.statements && disclaimer.statements.length > 0)) && (
        <Card>
          <CardContent className="p-6">
            {warnings.length > 0 && (
              <div className="mb-5">
                <div className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Model warnings
                </div>
                <ul className="space-y-2">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-warning flex-shrink-0">•</span>
                      {escHtml(w)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {disclaimer?.statements && disclaimer.statements.length > 0 && (
              <div className={cn(warnings.length > 0 && "pt-4 border-t border-border-light")}>
                <div className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {escHtml(disclaimer.title || 'Disclaimer')}
                </div>
                <ul className="space-y-2">
                  {disclaimer.statements.map((s, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-primary flex-shrink-0">•</span>
                      {escHtml(s)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ErrorCard({ err }: { err: { code: string; message: string; skipped: { Chemotherapy: string; Hormone_Therapy: string; Radio_Therapy: string; reason?: string }[] } }) {
  const isNoOptions = err.code === 'no_valid_treatment_combinations'
  return (
    <div className={cn("animate-result-appear rounded-2xl border p-6", isNoOptions ? "skipped-card" : "error-card")}>
      <div className="flex items-start gap-3 mb-4">
        {isNoOptions ? (
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
        ) : (
          <CircleAlert className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
        )}
        <div>
          <div className="font-semibold text-text-primary mb-1">
            {isNoOptions ? 'No valid treatment combinations' : 'API error'}
          </div>
          <div className="text-sm text-text-secondary">{escHtml(err.message)}</div>
        </div>
      </div>
      {err.skipped && err.skipped.length > 0 && (
        <div className="mt-3 text-sm text-text-secondary">
          <div className="font-medium text-text-primary mb-2">Filtered combinations:</div>
          <ul className="space-y-1">
            {err.skipped.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-warning flex-shrink-0">–</span>
                <span>
                  Chemo: {s.Chemotherapy} / Hormone: {s.Hormone_Therapy} / Radio: {s.Radio_Therapy}
                  {s.reason && <span className="text-text-muted"> — {escHtml(s.reason)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {err.code === 'network_error' && (
        <div className="mt-4 text-xs text-text-muted">
          Make sure the FastAPI server is running at <code>https://predicting-breast-cancer-t90u.onrender.com</code>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[80, 100, 60, 90].map((h, i) => (
        <div key={i} className="rounded-2xl border border-border-light overflow-hidden" style={{ height: h }}>
          <div
            className="h-full w-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, #f3e8f3 25%, #ede4ed 50%, #f3e8f3 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      ))}
    </div>
  )
}

export function PredictorPage() {
  const { state, setField, setPredicting, setResults, loadPreset, resetProfile } = useAppStore()
  const { runPrediction } = usePrediction()
  const resultsRef = useRef<HTMLDivElement>(null)
  const p = state.patientProfile

  const handlePredict = useCallback(async () => {
    setPredicting(true)
    const { rec, pred, err } = await runPrediction(p)
    setResults(rec, pred, err)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [p, runPrediction, setPredicting, setResults])

  const handleSlider = (field: keyof PatientProfile, val: number) => {
    setField(field, val as PatientProfile[keyof PatientProfile])
  }

  return (
    <div className="animate-page-transition max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4 bg-primary-light text-primary border-primary/20">
          <UserRound className="w-3.5 h-3.5 mr-1.5" />
          Patient predictor
        </Badge>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-3">
          Build a patient profile
        </h1>
        <p className="text-text-secondary text-lg">
          All 8 treatment combinations are scored by the SVM model. Clinically implausible options are filtered automatically.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-3 mb-8">
        {(['luminalA', 'her2', 'triple'] as const).map(type => (
          <Button
            key={type}
            variant="outline"
            className="rounded-full text-sm font-medium"
            onClick={() => loadPreset(type)}
          >
            {type === 'luminalA' ? 'Luminal A — Low risk' : type === 'her2' ? 'HER2-Positive' : 'Triple-Negative'}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="rounded-full text-sm font-medium text-text-secondary hover:text-primary"
          onClick={resetProfile}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-10">

              {/* ── Clinical ── */}
              <section>
                <SectionHeader
                  icon={Stethoscope}
                  title="Clinical profile"
                  subtitle="Demographics, staging, and tumour grade"
                />
                <div className="space-y-8">
                  <SliderField
                    label="Age at diagnosis"
                    value={p.age}
                    min={25}
                    max={90}
                    displayValue={`${p.age} years`}
                    onChange={(v) => handleSlider('age', v)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">Menopausal status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Pre', 'Post'] as const).map(v => (
                        <OptionButton
                          key={v}
                          active={p.menopausalStatus === v}
                          onClick={() => setField('menopausalStatus', v)}
                        >
                          {v}-menopausal
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">Tumour stage</label>
                    <div className="grid grid-cols-4 gap-3">
                      {([1, 2, 3, 4] as const).map(v => (
                        <OptionButton
                          key={v}
                          active={p.tumorStage === v}
                          onClick={() => setField('tumorStage', v)}
                        >
                          Stage {STAGE_LABELS[v - 1]}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">Neoplasm histologic grade</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([1, 2, 3] as const).map(v => (
                        <OptionButton
                          key={v}
                          active={p.grade === v}
                          onClick={() => setField('grade', v)}
                        >
                          Grade {v}
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-border-light" />

              {/* ── Tumour ── */}
              <section>
                <SectionHeader
                  icon={Activity}
                  title="Tumour characteristics"
                  subtitle="Size and nodal involvement"
                />
                <div className="space-y-8">
                  <SliderField
                    label="Tumour size"
                    value={p.tumorSize}
                    min={1}
                    max={150}
                    displayValue={`${p.tumorSize} mm`}
                    onChange={(v) => handleSlider('tumorSize', v)}
                  />
                  <SliderField
                    label="Lymph nodes examined positive"
                    value={p.nodes}
                    min={0}
                    max={30}
                    displayValue={`${p.nodes}`}
                    onChange={(v) => handleSlider('nodes', v)}
                  />
                </div>
              </section>

              <div className="border-t border-border-light" />

              {/* ── Biomarkers ── */}
              <section>
                <SectionHeader
                  icon={Dna}
                  title="Biomarkers"
                  subtitle="Receptor status drives systemic therapy eligibility"
                />
                <div className="space-y-8">
                  {([
                    { field: 'er' as const, label: 'ER Status' },
                    { field: 'pr' as const, label: 'PR Status' },
                    { field: 'her2' as const, label: 'HER2 Status' },
                  ]).map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-text-primary mb-3">{label}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Positive', 'Negative'] as const).map(v => (
                          <OptionButton
                            key={v}
                            active={p[field] === v}
                            onClick={() => setField(field, v)}
                          >
                            {v}
                          </OptionButton>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="p-4 rounded-xl bg-primary-light border border-border-light text-sm text-text-secondary">
                    <AlertTriangle className="w-4 h-4 text-primary inline mr-2" />
                    Receptor status drives the clinical plausibility filter. For example, hormone therapy is only considered for ER+ or PR+ patients.
                  </div>
                </div>
              </section>

              <div className="border-t border-border-light" />

              {/* ── Treatment ── */}
              <section>
                <SectionHeader
                  icon={Pill}
                  title="Current treatment"
                  subtitle="Set the baseline the model will compare against"
                />
                <div className="space-y-8">
                  <p className="text-sm text-text-secondary">
                    Set the patient&apos;s <strong>current</strong> treatment. The model will compare all other combinations against this baseline.
                  </p>
                  {([
                    { field: 'chemotherapy' as const, label: 'Chemotherapy' },
                    { field: 'hormoneTherapy' as const, label: 'Hormone Therapy' },
                    { field: 'radioTherapy' as const, label: 'Radio Therapy' },
                  ]).map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-text-primary mb-3">{label}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Yes', 'No'] as const).map(v => (
                          <OptionButton
                            key={v}
                            active={p[field] === v}
                            onClick={() => setField(field, v)}
                          >
                            {v}
                          </OptionButton>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Predict button */}
              <div className="pt-6 border-t border-border-light">
                <Button
                  onClick={handlePredict}
                  disabled={state.isPredicting}
                  className="w-full btn-primary py-6 rounded-xl text-white font-medium flex items-center justify-center gap-3 text-base h-auto"
                >
                  {state.isPredicting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Calling API…</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Predict optimal treatment</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div ref={resultsRef} className="mt-8">
            {state.isPredicting ? (
              <LoadingSkeleton />
            ) : state.apiError ? (
              <ErrorCard err={state.apiError} />
            ) : state.recommendResult ? (
              <ResultsSection rec={state.recommendResult} pred={state.predictResult} />
            ) : (
              <div className="bg-white/50 rounded-2xl border-2 border-dashed border-border-light p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center text-primary text-2xl">
                  <Wand2 className="w-8 h-8" />
                </div>
                <p className="text-text-secondary font-medium mb-1">No results yet</p>
                <p className="text-text-muted text-sm">
                  Fill in the patient profile above and click <em>Predict optimal treatment</em>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-border-light p-6 sticky top-24">
            <h3 className="font-serif text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-primary" />
              Patient summary
            </h3>
            <div className="space-y-0 divide-y divide-border-light text-sm">
              {[
                ['Age', `${p.age} yrs · ${p.menopausalStatus}-menopausal`],
                ['Stage / Grade', `Stage ${STAGE_LABELS[p.tumorStage - 1]} · Grade ${p.grade}`],
                ['Tumour', `${p.tumorSize} mm · ${p.nodes} node(s)+`],
                ['ER / PR', `${p.er} / ${p.pr}`],
                ['HER2', p.her2],
                ['Chemo', p.chemotherapy],
                ['Hormone Tx', p.hormoneTherapy],
                ['Radio Tx', p.radioTherapy],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-3">
                  <span className="text-text-secondary">{k}</span>
                  <span className="font-medium text-text-primary text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-text-secondary flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              Educational demo only. Not for clinical decision-making.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}