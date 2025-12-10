"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { api } from "../utils/api"
import type { Publication } from "../../types"

export default function PublicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [publication, setPublication] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token")
    if (!token) {
      navigate("/sign-in")
      return
    }

    const fetchPublication = async () => {
      if (!id) return
      try {
        const data = await api.getPublication(id)
        setPublication(data)
      } catch (err) {
        setError("Failed to load publication")
      } finally {
        setLoading(false)
      }
    }

    fetchPublication()
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="aspect-video bg-gray-200 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
            {error || "Publication not found"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to publications
        </button>

        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {publication.images && publication.images.length > 0 && (
            <div className="aspect-video w-full overflow-hidden bg-gray-100">
              <img
                src={publication.images[0] || "/placeholder.svg"}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{publication.title}</h1>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="flex-1">
                <p className="text-sm text-gray-500">Written by</p>
                <p className="font-medium text-gray-900">{publication.author?.user.firstName +" "+ publication.author.user.lastName || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p className="font-medium text-gray-900">
                  {new Date(publication.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xl text-gray-700 italic">{publication.description}</p>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{publication.content}</p>
            </div>

            {publication.images && publication.images.length > 1 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {publication.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${publication.title} - Image ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
