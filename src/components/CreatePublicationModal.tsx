"use client"

import { useState } from "react"
import { api } from "../utils/api"
import type { CreatePublicationRequest } from "../types"
import RichTextEditor from "./RichTextEditor"
import { extractImagesFromHtml, insertImageIntoHtml } from "../utils/htmlHelper"

interface CreatePublicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreatePublicationModal({ isOpen, onClose, onSuccess }: CreatePublicationModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState("")
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const imageArray = images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      const data: CreatePublicationRequest = {
        title,
        description,
        content,
        images: imageArray,
        published,
      }

      await api.createPublication(data)
      setTitle("")
      setDescription("")
      setContent("")
      setImages("")
      setPublished(true)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось создать публикацию")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Создать публикацию</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите название публикации"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Краткое описание"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Контент <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              onImagesChange={(extractedImages: string[]) => {
                // Синхронизируем изображения из контента
                setImages(extractedImages.join("\n"))
              }}
              placeholder="Полное содержание публикации. Используйте toolbar для форматирования текста и добавления изображений."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Вставьте дополнительные URL изображений (по одному на строку)"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Изображения загруженные через редактор автоматически отображаются здесь. Вы также можете добавить URL вручную.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Опубликовать сразу
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              {loading ? "Создание..." : "Создать публикацию"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

