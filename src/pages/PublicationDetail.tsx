"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import EditPublicationModal from "../components/EditPublicationModal"
import { api } from "../utils/api"
import { showToast } from "../utils/toast"
import type { Publication, PublicationStatus } from "../types"

export default function PublicationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [publication, setPublication] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [changingStatus, setChangingStatus] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    // Get current user from localStorage
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUserId(user.id)
      }
    } catch {}
  }, [])

  const handleStatusChange = async (action: 'archive' | 'publish' | 'reject' | 'review') => {
    if (!id || !publication) return

    setChangingStatus(true)
    try {
      let updatedPublication: Publication

      switch (action) {
        case 'archive':
          updatedPublication = await api.archivePublication(id)
          showToast('Публикация успешно архивирована', 'success')
          break
        case 'publish':
          updatedPublication = await api.publishPublication(id)
          showToast('Публикация успешно опубликована', 'success')
          break
        case 'reject':
          updatedPublication = await api.rejectPublication(id)
          showToast('Публикация отклонена', 'success')
          break
        case 'review':
          updatedPublication = await api.reviewPublication(id)
          showToast('Публикация отправлена на проверку', 'success')
          break
        default:
          return
      }

      setPublication(updatedPublication)
    } catch (err: any) {
      showToast(err?.message || 'Не удалось изменить статус публикации', 'error')
    } finally {
      setChangingStatus(false)
    }
  }

  const handleEditSuccess = (updated: Publication) => {
    setPublication(updated)
  }

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
        // @ts-ignore
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
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900 flex-1">{publication.title}</h1>
              {publication.status && (
                <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                  publication.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                  publication.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                  publication.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {publication.status === 'PUBLISHED' ? 'Опубликовано' :
                   publication.status === 'UNDER_REVIEW' ? 'На проверке' :
                   publication.status === 'ARCHIVED' ? 'В архиве' :
                   'Черновик'}
                </span>
              )}
            </div>

            {/* Edit and Status Management Section - Only for author */}
            {currentUserId && publication.author.user.id === currentUserId && (
              <div className="mb-6 space-y-4">
                {/* Edit Publication Button */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Редактирование публикации</h3>
                    <p className="text-xs text-gray-600 mt-1">Изменить заголовок, описание и содержание</p>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редактировать
                  </button>
                </div>

                {/* Status Management Panel */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Управление статусом публикации</h3>
                  <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange('review')}
                    disabled={changingStatus || publication.status === 'UNDER_REVIEW'}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {changingStatus ? 'Обновление...' : 'Отправить на проверку'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('publish')}
                    disabled={changingStatus || publication.status === 'PUBLISHED'}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {changingStatus ? 'Обновление...' : 'Опубликовать'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('archive')}
                    disabled={changingStatus || publication.status === 'ARCHIVED'}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {changingStatus ? 'Обновление...' : 'Архивировать'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('reject')}
                    disabled={changingStatus || publication.status === 'DRAFT'}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {changingStatus ? 'Обновление...' : 'Отклонить'}
                  </button>
                </div>
                </div>
              </div>
            )}

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

      {/* Edit Publication Modal */}
      {publication && (
        <EditPublicationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
          publication={publication}
        />
      )}
    </div>
  )
}
