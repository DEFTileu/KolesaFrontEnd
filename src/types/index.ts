export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
}

export interface Publication {
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
