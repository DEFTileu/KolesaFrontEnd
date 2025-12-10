// Type definitions for Spring Backend entities

export interface User {
  id: string
  email: string
  username?: string
  avatarUrl?: string
  firstName?: string
  lastName?: string
  role: string
  updatedAt?: string
  createdAt?: string
}

export interface Publication {
  id: string
  title: string
  description: string
  content: string
  author: Seller
  images: string[]
  createdAt: string
  updatedAt: string
  published: boolean
}

export interface Seller {
  id:string
  user: User
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  status: number
}
