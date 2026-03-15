import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext=createContext()

export const AuthProvider=({children}) => {
  const [user,setUser]=useState(null)
  const [loading,setLoading]=useState(true)
  const navigate=useNavigate()

  useEffect(()=>{
    // check session
    const savedUser=localStorage.getItem('user')
    if(savedUser){
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  },[])

  const login=(username,password)=>{
    if(username==="testuser" && password==="Test123"){
      const u={username}
      setUser(u)
      localStorage.setItem('user',JSON.stringify(u))
      navigate('/list')
      return true
    }
    return false
  }

  const logout=()=>{
    setUser(null)
    localStorage.removeItem('user')
    navigate('/')
  }

  if(loading) return null

  return (
    <AuthContext.Provider value={{user,login,logout}}>
      {children}
    </AuthContext.Provider>
  )
}
