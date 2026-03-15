import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useContext(AuthContext)

  const handleSub = (e) => {
    e.preventDefault()
    const success = login(username, password)
    if (!success) {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Employee System Portal</h2>
        <p>Please enter your credentials.</p>
        <form onSubmit={handleSub}>
          <input 
            className="input-field" 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            autoComplete="username"
          />
          <input 
            className="input-field" 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            autoComplete="current-password"
          />
          <button className="btn btn-full" type="submit">
            Login
          </button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}

export default Login
