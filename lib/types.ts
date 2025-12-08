export interface FileDTO {
  id: string
  filename: string
  fileUrl: string
  uploadedAt: string
}

export interface PublicationDTO {
  id: string
  title: string
  description: string
  content: string
  price?: number
  brand?: string
  model?: string
  year?: number
  mileage?: number
  condition?: string
  engine?: string
  transmission?: string
  fuel?: string
  author: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  images: FileDTO[]
  createdAt: string
  updatedAt: string
  published: boolean
}
