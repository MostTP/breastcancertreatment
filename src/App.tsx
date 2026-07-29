import { Navigation } from '@/components/Navigation'
import { HomePage } from '@/pages/HomePage'
import { PredictorPage } from '@/pages/PredictorPage'
import { ModelInfoPage } from '@/pages/ModelInfoPage'
import { AboutPage } from '@/pages/AboutPage'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predictor" element={<PredictorPage />} />
            <Route path="/model" element={<ModelInfoPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-border-light py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-secondary">
            OncoPredict · Final Year Project Demo · Not a medical device
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App
