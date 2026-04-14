import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

import Login from './pages/Login'
import HomePage from './pages/Homepage'
import Dashboard from './pages/Dashboard'
import ProfileSetup from './pages/ProfileSetup'
import AccountSettings from './pages/AccountSettings'
import Messages from './pages/Messages'
import Matching from './pages/Matching'
import Navbar from './components/shared/Navbar'
import GuestNavbar from './components/shared/GuestNavbar'

import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>

      {/* is the user logged in or not. this is so we can display the correct navbar*/}
      {user ? <Navbar /> : <GuestNavbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
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
        <Route path="/profile" element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        <Route path="/matching" element={
          <ProtectedRoute>
            <Matching />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
