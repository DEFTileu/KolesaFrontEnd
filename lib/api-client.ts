const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api"

export interface AuthRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserDTO
}

export interface UserDTO {
  id: string
  email?: string
  username?: string
  name?: string
  firstName?: string
  lastName?: string
  role?: string
  avatarUrl?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface FileDTO {
  id: string
  filename: string
  fileUrl: string
  uploadedAt?: string
}

export interface CarPublication {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  mileage: number
  description: string
  imageUrl?: string
  engineType: string
  transmission: string
  fuelType: string
  condition: string
  publishedAt: string
  userId: string
  userName: string
  images: FileDTO[]
  content?: string
}

class ApiClient {
  private getStoredToken(): string | null {
    if (typeof window === "undefined") return null
    // Support both new and legacy keys for compatibility
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token")
    )
  }

  private withAuthHeaders(token?: string): HeadersInit {
    const authToken = token || this.getStoredToken()
    const headers: HeadersInit = { "Content-Type": "application/json" }
    if (authToken) (headers as any).Authorization = `Bearer ${authToken}`
    return headers
  }

  // Attempt to refresh tokens using stored refresh token
  private async refreshTokens(): Promise<AuthResponse> {
    if (typeof window === "undefined") throw new Error("No window context")
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) throw new Error("No refresh token available")

    const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!resp.ok) {
      throw new Error("Failed to refresh token")
    }

    const data: AuthResponse = await resp.json()
    try {
      localStorage.setItem("access_token", data.accessToken)
      localStorage.setItem("refresh_token", data.refreshToken)
      localStorage.setItem("auth_token", data.accessToken)
    } catch {}
    return data
  }

  // Fetch helper that retries once after refreshing tokens
  private async fetchWithAutoRefresh(input: string, init: RequestInit = {}, token?: string) {
    const headers: HeadersInit = { ...(init.headers as any) }
    const authToken = token || this.getStoredToken()
    if (authToken) (headers as any).Authorization = `Bearer ${authToken}`
    if (!(headers as any)["Content-Type"]) (headers as any)["Content-Type"] = "application/json"

    let response = await fetch(input, { ...init, headers })

    // Only attempt refresh when server indicates token expiration explicitly
    if (response.status === 401) {
      let shouldRefresh = false
      try {
        const cloned = response.clone()
        const data = await cloned.json().catch(() => null)
        if (data && typeof data === "object" && (data as any).error === "Token expired") {
          shouldRefresh = true
        }
      } catch {
        // ignore JSON parse errors
      }

      if (shouldRefresh) {
        try {
          const refreshed = await this.refreshTokens()
          const retryHeaders: HeadersInit = { ...(init.headers as any) }
          ;(retryHeaders as any).Authorization = `Bearer ${refreshed.accessToken}`
          if (!(retryHeaders as any)["Content-Type"]) (retryHeaders as any)["Content-Type"] = "application/json"
          response = await fetch(input, { ...init, headers: retryHeaders })
        } catch {
          // if refresh fails, return original 401 response
        }
      }
    }
    return response
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Do NOT attach Authorization for signup
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    // Do NOT attach Authorization for signin
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  }

  async getProfile(token?: string): Promise<UserDTO> {
    const response = await this.fetchWithAutoRefresh(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }, token)

    if (!response.ok) {
      throw new Error("Failed to fetch profile")
    }

    return response.json()
  }

  async logout(token?: string): Promise<void> {
    const authToken = token || this.getStoredToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    if (authToken) headers.Authorization = `Bearer ${authToken}`

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers,
    })
  }

  async getCars(token?: string): Promise<CarPublication[]> {
    const response = await this.fetchWithAutoRefresh(`${API_BASE_URL}/cars`, {
      method: "GET",
    }, token)

    if (!response.ok) {
      throw new Error("Failed to fetch cars")
    }

    return response.json()
  }

  async getCarById(id: string, token?: string): Promise<CarPublication> {
    const response = await this.fetchWithAutoRefresh(`${API_BASE_URL}/cars/${id}`, {
      method: "GET",
    }, token)

    if (!response.ok) {
      throw new Error("Failed to fetch car")
    }

    return response.json()
  }

  async getUserCars(token?: string): Promise<CarPublication[]> {
    const response = await this.fetchWithAutoRefresh(`${API_BASE_URL}/cars/user/my-cars`, {
      method: "GET",
    }, token)

    if (!response.ok) {
      throw new Error("Failed to fetch user cars")
    }

    return response.json()
  }

  async updateProfile(data: { firstName?: string; lastName?: string; name?: string; avatarUrl?: string | null }, token?: string): Promise<UserDTO> {
    const response = await this.fetchWithAutoRefresh(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Failed to update profile")
    }
    return response.json()
  }

  async changePassword(data: { currentPassword: string; newPassword: string }, token?: string): Promise<void> {
    const response = await this.fetchWithAutoRefresh(`${API_BASE_URL}/auth/change-password`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token)
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || "Failed to change password")
    }
  }
}

export const apiClient = new ApiClient()
