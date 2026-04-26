import React, { createContext, useContext, useState, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  full_name?: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  })

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/jwt/login', {
        username: email,
        password,
      })
      const { access_token } = response.data
      setToken(access_token)
      localStorage.setItem('token', access_token)

      const userResponse = await api.get('/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      setUser(userResponse.data)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || 'Login failed'
        : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
      })
      await login(email, password)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.detail || 'Registration failed'
        : 'Registration failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
