export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  isSeller?: boolean
  role?: string
}

export enum PublicationStatus {
  DRAFT = "DRAFT",
  UNDER_REVIEW = "UNDER_REVIEW",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED"
}

export interface Publication {
  id: string
  title: string
  description: string
  content: string
  author: Seller
  createdAt: string
  updatedAt: string
  published: boolean
  status?: PublicationStatus
  images: string[]
  price?: number
  year?: number
  mileage?: number
  brand?: string
  model?: string
}

export interface Seller{
  user: User
  id: string
  createdAt: string
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
  content: string
  images: string[]
  published: boolean
  price?: number
  year?: number
  mileage?: number
  brand?: string
  model?: string
}

export interface UpdatePublicationRequest {
  title?: string
  description?: string
  content?: string
  images?: string[]
  published?: boolean
  price?: number
  year?: number
  mileage?: number
  brand?: string
  model?: string
}

export const PublicationFilterType = {
  ALL: "ALL",
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED"
} as const

export type PublicationFilterTypeValue = typeof PublicationFilterType[keyof typeof PublicationFilterType]
