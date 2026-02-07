import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SplitView from './components/SplitView'
import LoginCallback from './components/LoginCallback'
import { DemoEvent } from './types/events'

function App() {
  const [events, setEvents] = useState<DemoEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const handleReset = () => {
    setEvents([])
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Main app route */}
        <Route path="/" element={
          <div className="w-full h-full">
            <SplitView
              events={events}
              isConnected={isConnected}
              onReset={handleReset}
              onEventsChange={setEvents}
              onConnectionChange={setIsConnected}
            />
          </div>
        } />

        {/* OAuth callback route */}
        <Route path="/callback" element={<LoginCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
