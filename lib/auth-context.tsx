"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type AuthResponse, type UserDTO, apiClient } from "./api-client"

interface AuthContextType {
  user: UserDTO | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshProfile: () => Promise<void>
  setUserInContext: (u: UserDTO) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken =
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      // Verify token is still valid
      apiClient
        .getProfile(storedToken)
        .then((u) => {
          setUser(u)
          // Keep user in localStorage for components that read directly
          try {
            localStorage.setItem("user", JSON.stringify(u))
          } catch {}
        })
        .catch(() => {
          localStorage.removeItem("access_token")
          localStorage.removeItem("auth_token")
          localStorage.removeItem("token")
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      const response: AuthResponse = await apiClient.login({ email, password })
      // Persist tokens
      localStorage.setItem("access_token", response.accessToken)
      localStorage.setItem("refresh_token", response.refreshToken)
      // Keep legacy key for compatibility if some parts still read it
      localStorage.setItem("auth_token", response.accessToken)
      setToken(response.accessToken)
      setUser(response.user)
      try {
        localStorage.setItem("user", JSON.stringify(response.user))
      } catch {}
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      setLoading(true)
      const response: AuthResponse = await apiClient.register({ email, password, name })
      // Persist tokens
      localStorage.setItem("access_token", response.accessToken)
      localStorage.setItem("refresh_token", response.refreshToken)
      // Legacy compatibility key
      localStorage.setItem("auth_token", response.accessToken)
      setToken(response.accessToken)
      setUser(response.user)
      try {
        localStorage.setItem("user", JSON.stringify(response.user))
      } catch {}
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await apiClient.logout(token)
      }
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("auth_token")
      localStorage.removeItem("token")
      setToken(null)
      setUser(null)
      setError(null)
    }
  }

  const clearError = () => setError(null)

  const refreshProfile = async () => {
    if (!token) return
    const u = await apiClient.getProfile(token)
    setUser(u)
    try {
      localStorage.setItem("user", JSON.stringify(u))
    } catch {}
  }

  const setUserInContext = (u: UserDTO) => {
    setUser(u)
    try {
      localStorage.setItem("user", JSON.stringify(u))
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, clearError, refreshProfile, setUserInContext }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
