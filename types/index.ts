// Type definitions for Spring Backend entities

export interface User {
  id: string
  email: string
  username?: string
  createdAt?: string
}

export interface Publication {
  id: string
  title: string
  description: string
  content: string
  author: User
  images: string[]
  createdAt: string
  updatedAt: string
  published: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  status: number
}
