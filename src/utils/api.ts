import type { AuthResponse, SignInRequest, SignUpRequest, CreatePublicationRequest, UpdatePublicationRequest, Publication } from "../types"
import { PublicationFilterType } from "../types"

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || "https://api-kolesa.javazhan.tech/api"

const getAccessToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token")


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
    const response = await requestWithRefresh(`${API_URL}/publications`, {
      method: "GET",
    })
    if (!response.ok) throw new Error("Failed to fetch publications")
    return response.json()
  },

  async getPublication(id: string): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}`, {
      method: "GET",
    })
    if (!response.ok) throw new Error("Failed to fetch publication")
    return response.json()
  },

  async getProfile() {
    const response = await requestWithRefresh(`${API_URL}/users/profile`, {
      method: "GET",
    })
    if (!response.ok) throw new Error("Failed to fetch profile")
    return response.json()
  },

  async updateProfile(data: { firstName?: string; lastName?: string; name?: string; avatarUrl?: string | null }) {
    const response = await requestWithRefresh(`${API_URL}/users/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to update profile")
    }
    return response.json()
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await requestWithRefresh(`${API_URL}/auth/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to change password")
    }
  },

  async becomeSeller() {
    const response = await requestWithRefresh(`${API_URL}/users/to-sell`, {
      method: "POST",
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to become seller")
    }
    return response.json().catch(() => ({}))
  },

  async getMyPublications(): Promise<Publication[]> {
    const response = await requestWithRefresh(`${API_URL}/publications/my`, {
      method: "GET",
    })
    if (!response.ok) throw new Error("Failed to fetch my publications")
    return response.json()
  },

  async getMyPublicationsByFilter(filterType: string): Promise<Publication[]> {
    const response = await requestWithRefresh(`${API_URL}/publications/my/filter/${filterType}`, {
      method: "GET",
    })
    if (!response.ok) throw new Error("Failed to fetch filtered publications")
    return response.json()
  },

  async createPublication(data: CreatePublicationRequest): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to create publication")
    }
    return response.json()
  },

  async deletePublication(id: string): Promise<void> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to delete publication")
    }
  },

  async archivePublication(id: string): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}/archive`, {
      method: "PUT",
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to archive publication")
    }
    return response.json()
  },

  async publishPublication(id: string): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}/publish`, {
      method: "PUT",
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to publish publication")
    }
    return response.json()
  },

  async rejectPublication(id: string): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}/reject`, {
      method: "PUT",
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to reject publication")
    }
    return response.json()
  },

  async reviewPublication(id: string): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}/review`, {
      method: "PUT",
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to submit publication for review")
    }
    return response.json()
  },

  async updatePublication(id: string, data: UpdatePublicationRequest): Promise<Publication> {
    const response = await requestWithRefresh(`${API_URL}/publications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || "Failed to update publication")
    }
    return response.json()
  },
}
