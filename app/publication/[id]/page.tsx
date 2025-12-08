"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarIcon, ArrowLeftIcon } from "lucide-react"

interface Publication {
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

export default function PublicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [publication, setPublication] = useState<Publication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token")
    if (!token) {
      router.push("/sign-in")
      return
    }

    fetchPublication()
  }, [params.id, router, mounted])

  const fetchPublication = async () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/publications/${params.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch publication")
      }

      const data = await response.json()
      setPublication(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load publication")
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading publication...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-destructive text-lg mb-4">{error || "Publication not found"}</p>
            <Button onClick={() => router.push("/home")}>Back to Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push("/home")} className="mb-6">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Publications
        </Button>

        <article className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">{publication.title}</h1>

            <p className="text-xl text-muted-foreground text-pretty">{publication.description}</p>

            {/* Author Info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(publication.author.firstName, publication.author.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {publication.author.firstName} {publication.author.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{publication.author.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(publication.createdAt)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Images Gallery */}
          {publication.images && publication.images.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publication.images.map((image, index) => (
                  <div key={image.id} className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={
                        image.url ||
                        `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(publication.title + " image " + (index + 1)) || "/placeholder.svg"}`
                      }
                      alt={`${publication.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <Card className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">{publication.content}</div>
            </div>
          </Card>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
            <span>Published: {formatDate(publication.createdAt)}</span>
            {publication.updatedAt !== publication.createdAt && (
              <span>Last updated: {formatDate(publication.updatedAt)}</span>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
