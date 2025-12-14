"use client"

import { useState, useEffect } from "react"
import { api } from "../utils/api"
import { showToast } from "../utils/toast"
import type { Publication, UpdatePublicationRequest } from "../types"
import RichTextEditor from "./RichTextEditor"
import { extractImagesFromHtml, insertImageIntoHtml } from "../utils/htmlHelper"

interface EditPublicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (updated: Publication) => void
  publication: Publication
}

export default function EditPublicationModal({
  isOpen,
  onClose,
  onSuccess,
  publication
}: EditPublicationModalProps) {
  const [title, setTitle] = useState(publication.title)
  const [description, setDescription] = useState(publication.description)
  const [content, setContent] = useState(publication.content)
  const [images, setImages] = useState(publication.images.join("\n"))
  const [loading, setLoading] = useState(false)

  // Получаем токен для загрузки файлов
  const token = localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    localStorage.getItem("token")

  // Обновляем поля при изменении публикации
  useEffect(() => {
    setTitle(publication.title)
    setDescription(publication.description)
    setContent(publication.content)
    setImages(publication.images.join("\n"))
  }, [publication])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !content.trim()) {
      showToast("Заполните все обязательные поля", "error")
      return
    }

    setLoading(true)

    try {
      const imageArray = images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      const data: UpdatePublicationRequest = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        images: imageArray,
      }

      const updated = await api.updatePublication(publication.id, data)
      showToast("Публикация успешно обновлена", "success")
      onSuccess(updated)
      onClose()
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Не удалось обновить публикацию",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    const hasChanges =
      title !== publication.title ||
      description !== publication.description ||
      content !== publication.content ||
      images !== publication.images.join("\n")

    if (hasChanges && !confirm("У вас есть несохраненные изменения. Закрыть без сохранения?")) {
      return
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Редактировать публикацию</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Введите заголовок публикации"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Краткое описание <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Краткое описание публикации"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Полное содержание <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              onImagesChange={(extractedImages: string[]) => {
                // Синхронизируем изображения из контента
                setImages(extractedImages.join("\n"))
              }}
              placeholder="Полное содержание публикации. Используйте toolbar для форматирования."
              disabled={loading}
              authToken={token}
            />
            <p className="text-xs text-gray-500 mt-1">
              Используйте панель инструментов для форматирования текста и добавления изображений
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дополнительные изображения (URL)
            </label>
            <textarea
              value={images}
              onChange={(e) => {
                const newImages = e.target.value
                setImages(newImages)

                // Синхронизируем с контентом: добавляем новые URL как изображения
                const currentImages = extractImagesFromHtml(content)
                const newImageUrls = newImages
                  .split("\n")
                  .map(url => url.trim())
                  .filter(url => url && !currentImages.includes(url))

                if (newImageUrls.length > 0) {
                  let updatedContent = content
                  newImageUrls.forEach(url => {
                    updatedContent = insertImageIntoHtml(updatedContent, url)
                  })
                  setContent(updatedContent)
                }
              }}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none font-mono text-sm"
              placeholder="Вставьте дополнительные URL изображений (по одному на строку)"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Изображения загруженные через редактор автоматически отображаются здесь. Вы также можете добавить URL вручную.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

