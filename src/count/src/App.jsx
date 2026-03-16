import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Countdown from './pages/Countdown'
import CountdownFinished from './pages/CountdownFinished'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/countdown" element={<Countdown />} />
        <Route path="/countdown-finished" element={<CountdownFinished />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
