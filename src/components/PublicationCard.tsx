"use client"

import { useNavigate } from "react-router-dom"
import type { Publication } from "../types"

interface PublicationCardProps {
  publication: Publication
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/publication/${publication.id}`)}
      className="group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
    >
      {publication.images && publication.images.length > 0 ? (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={publication.images[0] || "/placeholder.svg"}
            alt={publication.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {publication.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{publication.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">By {publication.author?.username || "Unknown"}</span>
          <span className="text-gray-400">{new Date(publication.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
