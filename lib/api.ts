// API utility functions for interacting with Spring Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
}

export interface Publication {
  id: string
  title: string
  description: string
  content: string
  author: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  images: Array<{
    id: string
    filename: string
    url: string
  }>
  published: boolean
  createdAt: string
  updatedAt: string
}

class ApiService {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Auth endpoints
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Failed to sign in")
    }

    return response.json()
  }

  async signUp(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to sign up")
    }

    return response.json()
  }

  // Publication endpoints
  async getPublications(): Promise<Publication[]> {
    const response = await fetch(`${API_BASE_URL}/api/publications`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch publications")
    }

    return response.json()
  }

  async getPublication(id: string): Promise<Publication> {
    const response = await fetch(`${API_BASE_URL}/api/publications/${id}`, {
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch publication")
    }

    return response.json()
  }

  async createPublication(data: {
    title: string
    description: string
    content: string
  }): Promise<Publication> {
    const response = await fetch(`${API_BASE_URL}/api/publications`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to create publication")
    }

    return response.json()
  }

  async updatePublication(id: string, data: Partial<Publication>): Promise<Publication> {
    const response = await fetch(`${API_BASE_URL}/api/publications/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to update publication")
    }

    return response.json()
  }

  async deletePublication(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/publications/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete publication")
    }
  }
}

export const api = new ApiService()
