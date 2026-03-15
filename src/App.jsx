import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import Login from './pages/Login'
import List from './pages/List'
import Details from './pages/Details'
import Results from './pages/Results'

function ProtectedRoute({children}){
  const {user}=useContext(AuthContext)
  if(!user){
    return <Navigate to="/" />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/list" element={<ProtectedRoute><List /></ProtectedRoute>} />
      <Route path="/details/:id" element={<ProtectedRoute><Details /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><Results /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
