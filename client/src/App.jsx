import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data.user)
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.get('email'),
        password: formData.get('password')
      })
      
      localStorage.setItem('accessToken', response.data.accessToken)
      setUser(response.data.user)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
      })
      
      localStorage.setItem('accessToken', response.data.accessToken)
      setUser(response.data.user)
      setError(null)
    } catch (err) {
      console.error('Registration error:', err)
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      'Registration failed'
      setError(errorMsg)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    setUser(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="container">
        <h1>Welcome!</h1>
        <div className="user-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      
      {error && <div className="message error">{error}</div>}
      
      {isLogin ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" name="password" required />
          </div>
          <button type="submit">Login</button>
          <div className="toggle">
            Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Register</button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Username:</label>
            <input type="text" name="username" required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input type="password" name="password" required />
          </div>
          <button type="submit">Register</button>
          <div className="toggle">
            Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Login</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default App
