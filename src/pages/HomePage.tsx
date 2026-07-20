import { Link } from 'react-router-dom'
import { Database, Bot, FlaskConical, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Database, title: 'METABRIC dataset', desc: 'Real clinical training data' },
  { icon: Bot, title: 'SVM classifier', desc: 'Calibrated probability scores' },
  { icon: FlaskConical, title: 'SHAP explanations', desc: 'Feature-level attributions' },
  { icon: ShieldCheck, title: 'Clinical guardrails', desc: 'Implausible combos filtered' },
]

export function HomePage() {
  return (
    <div className="animate-page-transition">
      <section className="gradient-hero pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-primary-light text-primary border-primary/20">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Final Year Project
          </Badge>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-text-primary max-w-4xl leading-tight mb-8">
            Predicting the most effective<br />
            <span className="text-primary italic">breast cancer</span> treatment.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed">
            A machine-learning decision support tool trained on the METABRIC dataset. An SVM model evaluates patient features and ranks all eight treatment combinations by predicted outcome probability.
          </p>
          <div className="flex flex-wrap gap-4 mb-16">
            <Button asChild className="btn-primary rounded-full px-8 py-6 text-base">
              <Link to="/predictor" className="flex items-center gap-2">
                Try the predictor <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8 py-6 text-base">
              <Link to="/model" className="flex items-center gap-2">
                View model info
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-border-light card-hover">
                <div className="icon-circle mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-text-primary mb-1">{title}</div>
                <div className="text-sm text-text-secondary">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-border-light card-hover">
              <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">SVM, not rule-based</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                The model is a Calibrated SVM trained to predict a composite outcome (≥60 months survival, living, no relapse). For a given patient, it scores all eight chemotherapy × hormone therapy × radio therapy combinations and ranks them by probability.
              </p>
              <Link to="/model" className="text-primary font-medium flex items-center gap-2 hover:gap-3 transition-all">
                See model metrics <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-border-light card-hover">
              <h3 className="font-serif text-2xl font-bold text-text-primary mb-4">Try it now</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Enter patient features, receptor status, and current treatment. Receive a ranked list of all plausible treatment combinations with outcome probabilities and SHAP explanations.
              </p>
              <Button asChild className="btn-primary rounded-full px-6 py-3">
                <Link to="/predictor" className="flex items-center gap-2">
                  Open predictor <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
