import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Bot, Filter, FlaskConical, Code, AlertTriangle } from 'lucide-react'
import { cn, escHtml } from '@/lib/utils'

const methods = [
  {
    icon: Database,
    title: 'METABRIC training data',
    body: 'The model was trained on the Molecular Taxonomy of Breast Cancer International Consortium (METABRIC) dataset. The composite target is 1 when survival is ≥60 months, the patient is living, and relapse-free status indicates no relapse; 0 otherwise.',
  },
  {
    icon: Bot,
    title: 'Calibrated SVM classifier',
    body: 'A Support Vector Machine (RBF kernel) wrapped in CalibratedClassifierCV gives probability outputs. Hyperparameters (C, gamma) were chosen via 5-fold grid-search optimising ROC AUC.',
  },
  {
    icon: Filter,
    title: 'Clinical plausibility filter',
    body: 'Before scoring, each of the 8 chemotherapy × hormone × radio combinations is checked against conservative clinical rules (e.g. hormone therapy is not recommended for ER−/PR− patients). Implausible combinations are skipped and reported back to the UI.',
  },
  {
    icon: FlaskConical,
    title: 'SHAP explanations',
    body: "The /explain endpoint uses KernelSHAP to attribute the model's prediction for the top-ranked treatment to individual input features. A background dataset from METABRIC anchors the explainer.",
  },
  {
    icon: Code,
    title: 'API integration',
    body: 'This frontend calls POST /recommend and POST /predict in parallel when you click Predict. GET /model-info is fetched once on the Model Info page. All data is real — nothing is simulated.',
  },
]

const endpoints = [
  ['POST', '/predict', 'Probability score for the given patient + treatment'],
  ['POST', '/recommend', 'Ranked treatment combinations with SHAP for top option'],
  ['POST', '/explain', 'SHAP attributions (called server-side from /recommend)'],
  ['GET', '/model-info', 'Model metadata, metrics, and disclaimer'],
  ['GET', '/disclaimer', 'Medical disclaimer text'],
]

const techStack = [
  'FastAPI · Python backend',
  'scikit-learn SVM + CalibratedClassifierCV',
  'SHAP (KernelExplainer)',
  'React + TypeScript + Vite SPA',
  'Tailwind CSS + shadcn/ui',
  'METABRIC clinical dataset',
]

export function AboutPage() {
  return (
    <div className="animate-page-transition max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Badge variant="secondary" className="mb-4 bg-primary-light text-primary border-primary/20">
          Methodology
        </Badge>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-6">
          How OncoPredict works
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          OncoPredict uses a real machine learning backend trained on the METABRIC breast cancer dataset. It does not simulate predictions — every result comes from the live API.
        </p>
      </div>

      <div className="space-y-5 mb-12">
        {methods.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-white rounded-2xl p-8 border border-border-light border-l-4 border-l-transparent hover:border-l-primary transition-all hover:translate-x-2">
            <div className="flex items-start gap-4">
              <div className="icon-circle flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary leading-relaxed">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-text-primary mb-1">Research prototype.</p>
            <p className="text-text-secondary text-sm leading-relaxed">
              This system has not been externally validated or cleared for clinical use. Predictions are statistical estimates based on a proxy outcome and do not represent causal treatment effects. Always consult qualified oncologists before making treatment decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-serif text-lg font-bold text-text-primary mb-4">API endpoints used</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              {endpoints.map(([method, path, desc]) => (
                <li key={path}>
                  <span className={cn(
                    "font-mono text-xs px-1.5 py-0.5 rounded",
                    method === 'GET' ? "bg-blue-50 text-blue-700" : "bg-primary-light text-primary"
                  )}>
                    {method}
                  </span>
                  <code className="text-primary ml-1">{path}</code>
                  <span className="text-text-muted ml-1 text-xs">— {desc}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-serif text-lg font-bold text-text-primary mb-4">Tech stack</h3>
            <ul className="space-y-2 text-text-secondary text-sm">
              {techStack.map(t => (
                <li key={t} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
