import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Feed from './components/Feed'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [showSignup, setShowSignup] = useState(false)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return (
      <div className="auth-container">
        {showSignup ? (
          <Signup onLogin={handleLogin} onToggle={() => setShowSignup(false)} />
        ) : (
          <Login onLogin={handleLogin} onToggle={() => setShowSignup(true)} />
        )}
      </div>
    )
  }

  return <Feed user={user} onLogout={handleLogout} />
}

export default App
