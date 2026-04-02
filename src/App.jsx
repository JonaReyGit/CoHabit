import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import Messages from './pages/Messages'
import Matching from './pages/Matching'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar from './components/shared/Navbar'

function App() {
  return (
    <BrowserRouter>
      <ProtectedRoute>
        <Navbar/>
      </ProtectedRoute>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/matching" element={<ProtectedRoute><Matching /></ProtectedRoute>} />
        {/* anything else just goes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
