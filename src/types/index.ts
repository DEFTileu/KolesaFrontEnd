export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  id: string
  title: string
  description: string
  content: string
  author: User
  createdAt: string
  updatedAt: string
  published: boolean
  images: string[]
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  username: string
  firstName: string
  lastName: string
  password: string
}

export interface CreatePublicationRequest {
  title: string
  description: string
  price: number
  images?: string[]
  year?: number
  mileage?: number
  brand?: string
  model?: string
}
