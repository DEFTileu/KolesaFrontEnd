import type { AuthResponse, SignInRequest, SignUpRequest, Publication } from "../types"

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9090/api"

const getAccessToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token")

const authHeaders = () => {
  const token = getAccessToken()
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  }
}

async function refreshTokens() {
  const refreshToken = localStorage.getItem("refresh_token")
  if (!refreshToken) throw new Error("No refresh token")
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) throw new Error("Failed to refresh token")
  const data: AuthResponse = await response.json()
  try {
    localStorage.setItem("access_token", data.accessToken)
    localStorage.setItem("refresh_token", data.refreshToken)
    localStorage.setItem("auth_token", data.accessToken)
  } catch {}
  return data
}

async function requestWithRefresh(input: string, init: RequestInit = {}) {
  // attach current token
  const headers: HeadersInit = { ...(init.headers as any) }
  const token = getAccessToken()
  if (token) (headers as any).Authorization = `Bearer ${token}`
  if (!(headers as any)["Content-Type"]) (headers as any)["Content-Type"] = "application/json"

  let res = await fetch(input, { ...init, headers })

  if (res.status === 401) {
    let shouldRefresh = false
    try {
      const cloned = res.clone()
      const data = await cloned.json().catch(() => null)
      if (data && typeof data === "object" && (data as any).error === "Token expired") {
        shouldRefresh = true
      }
    } catch {}

    if (shouldRefresh) {
      try {
        const refreshed = await refreshTokens()
        const retryHeaders: HeadersInit = { ...(init.headers as any) }
        ;(retryHeaders as any).Authorization = `Bearer ${refreshed.accessToken}`
        if (!(retryHeaders as any)["Content-Type"]) (retryHeaders as any)["Content-Type"] = "application/json"
        res = await fetch(input, { ...init, headers: retryHeaders })
      } catch {}
    }
  }
  return res
}

export const api = {
  async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Sign in failed")
    return response.json()
  },

  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Sign up failed")
    return response.json()
  },

  async getPublications(): Promise<Publication[]> {
    const token = getAccessToken()
    const response = await fetch(`${API_URL}/publications`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
    if (!response.ok) throw new Error("Failed to fetch publications")
    return response.json()
  },

  async getPublication(id: string): Promise<Publication> {
    const token = getAccessToken()
    const response = await fetch(`${API_URL}/publications/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
    if (!response.ok) throw new Error("Failed to fetch publication")
    return response.json()
  },

  async getProfile() {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "GET",
      headers: authHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch profile")
    return response.json()
  },

  async updateProfile(data: { firstName?: string; lastName?: string; name?: string; avatarUrl?: string | null }) {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to update profile")
    }
    return response.json()
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to change password")
    }
  },
}
