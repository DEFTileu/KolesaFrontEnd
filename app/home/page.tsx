"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PublicationCard } from "@/components/publication-card"
import { Navbar } from "@/components/navbar"

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

export default function HomePage() {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
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

    fetchPublications()
  }, [router, mounted])

  const fetchPublications = async () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/publications`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch publications")
      }

      const data = await response.json()
      setPublications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load publications")
    } finally {
      setIsLoading(false)
    }
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
            <p className="text-muted-foreground">Loading publications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-balance">Publications</h1>
            <p className="text-muted-foreground mt-2">Discover and read amazing articles from our community</p>
          </div>
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">{error}</div>}

        {publications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No publications found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publications.map((publication) => (
              <PublicationCard key={publication.id} publication={publication} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
