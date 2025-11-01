import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import ArLocationMap from './pages/ArLocationMap.tsx'


function NotFound() {
  return (
    <div style={{ padding: 20 }}>
      <h2>404 — Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <p>
        <Link to="/">Go back home</Link>
      </p>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ar-location-map" element={<ArLocationMap />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
