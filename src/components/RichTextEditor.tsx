"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { uploadFileToProject } from '../utils/fileUploadHelper'
import { extractImagesFromHtml } from '../utils/htmlHelper'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  onImagesChange?: (images: string[]) => void
  placeholder?: string
  disabled?: boolean
  authToken?: string | null
}

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean'],
]

const dataUrlToFile = (dataUrl: string, filename: string) => {
  const [header, base64Data] = dataUrl.split(',')
  if (!base64Data) throw new Error('Некорректные данные изображения')
  const mimeMatch = header.match(/data:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream'
  const binaryString = atob(base64Data)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new File([bytes], filename, { type: mime })
}

export default function RichTextEditor({
  content,
  onChange,
  onImagesChange,
  placeholder = 'Начните вводить текст...',
  disabled = false,
  authToken = null,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill | null>(null)
  const [uploadCounter, setUploadCounter] = useState(0)
  const isUploading = uploadCounter > 0

  const insertImageAtCursor = useCallback((url: string) => {
    const editor = quillRef.current?.getEditor()
    if (!editor) return
    const range = editor.getSelection(true) ?? { index: editor.getLength(), length: 0 }
    console.log('[Quill] Inserting image at index', range.index, 'URL:', url)

    // Insert embed
    editor.insertEmbed(range.index, 'image', url, 'user')

    // Move cursor after image
    editor.setSelection(range.index + 1, 0)

    // Manually trigger onChange with updated HTML
    const html = editor.root.innerHTML
    console.log('[Quill] After insert, triggering onChange with HTML length:', html.length)
    onChange(html)
  }, [onChange])

  const replaceImageElement = useCallback((imgEl: HTMLImageElement, url: string) => {
    const editor = quillRef.current?.getEditor()
    if (!editor) return

    try {
      const blot = (Quill as any).find?.(imgEl)
      if (!blot) {
        console.warn('[Quill] Could not find blot for image, inserting new one')
        insertImageAtCursor(url)
        return
      }
      const index = editor.getIndex(blot)
      console.log('[Quill] Replacing image at index', index, 'URL:', url)
      editor.deleteText(index, 1)
      editor.insertEmbed(index, 'image', url, 'user')
      editor.setSelection(index + 1, 0)

      // Manually trigger onChange with updated HTML
      const html = editor.root.innerHTML
      console.log('[Quill] After replace, triggering onChange with HTML length:', html.length)
      onChange(html)
    } catch (err) {
      console.error('[Quill] Error replacing image:', err)
      insertImageAtCursor(url)
    }
  }, [insertImageAtCursor, onChange])

  const handleImageUpload = useCallback(async (file: File, replaceImage?: HTMLImageElement) => {
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Размер файла не должен превышать 5 МБ')
      return
    }

    setUploadCounter(prev => prev + 1)
    try {
      const result = await uploadFileToProject(
        file,
        'kolesa',
        'publication-images',
        'https://api-todo.javazhan.tech',
        authToken,
      )

      if (replaceImage) {
        replaceImageElement(replaceImage, result.url)
      } else {
        insertImageAtCursor(result.url)
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      alert(error instanceof Error ? error.message : 'Не удалось загрузить изображение')
    } finally {
      setUploadCounter(prev => Math.max(0, prev - 1))
    }
  }, [authToken, insertImageAtCursor, replaceImageElement])

  const processBase64Images = useCallback(async () => {
    const editor = quillRef.current?.getEditor()
    const root = editor?.root
    if (!root || !editor) return

    const allImages = Array.from(root.querySelectorAll('img'))
    console.log('[Quill] Found', allImages.length, 'images in editor')

    const images = allImages.filter(img => {
      const src = img.getAttribute('src') || ''
      const isBase64 = src.startsWith('data:')
      const isNotUploading = img.dataset.uploading !== 'true'
      console.log('[Quill] Image src:', src.substring(0, 50), '...', 'isBase64:', isBase64, 'canProcess:', isBase64 && isNotUploading)
      return isBase64 && isNotUploading
    })

    console.log('[Quill] Processing', images.length, 'base64 images')

    for (const img of images) {
      const src = img.getAttribute('src') || ''
      try {
        img.dataset.uploading = 'true'
        console.log('[Quill] Converting base64 to file and uploading...')
        const file = dataUrlToFile(src, 'clipboard-image.png')
        await handleImageUpload(file, img)
        console.log('[Quill] Successfully uploaded image')
      } catch (err) {
        console.error('[Quill] Ошибка загрузки изображения из буфера обмена', err)
      } finally {
        delete img.dataset.uploading
      }
    }
  }, [handleImageUpload])

  const handleImageInsert = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        await handleImageUpload(file)
      }
    }
    input.click()
  }, [handleImageUpload])

  useEffect(() => {
    const editor = quillRef.current?.getEditor()
    const root = editor?.root
    if (!root) return

    const handlePaste = (event: ClipboardEvent) => {
      console.log('[Quill] Paste event detected')
      const files = Array.from(event.clipboardData?.files ?? [])
      const imageFiles = files.filter(file => file.type.startsWith('image/'))

      if (imageFiles.length) {
        console.log('[Quill] Detected', imageFiles.length, 'image files in paste')
        event.preventDefault()
        event.stopPropagation()
        imageFiles.forEach(file => handleImageUpload(file))
      } else {
        console.log('[Quill] No image files, will check for base64 after paste')
        setTimeout(() => {
          void processBase64Images()
        }, 100)
      }
    }

    const handleDrop = (event: DragEvent) => {
      console.log('[Quill] Drop event detected')
      const files = Array.from(event.dataTransfer?.files ?? [])
      const imageFiles = files.filter(file => file.type.startsWith('image/'))

      if (imageFiles.length) {
        console.log('[Quill] Detected', imageFiles.length, 'image files in drop')
        event.preventDefault()
        event.stopPropagation()
        imageFiles.forEach(file => handleImageUpload(file))
      }
    }

    root.addEventListener('paste', handlePaste, true)
    root.addEventListener('drop', handleDrop, true)
    return () => {
      root.removeEventListener('paste', handlePaste, true)
      root.removeEventListener('drop', handleDrop, true)
    }
  }, [handleImageUpload, processBase64Images])

  useEffect(() => {
    const editor = quillRef.current?.getEditor()
    const handler = () => {
      void processBase64Images()
    }
    if (editor) {
      editor.on('text-change', handler)
    }
    return () => {
      if (editor) {
        editor.off('text-change', handler)
      }
    }
  }, [processBase64Images])

  const modules = useMemo(() => ({
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: handleImageInsert,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), [handleImageInsert])




  const handleChange = (html: string) => {
    console.log('[Quill] Content changed, length:', html.length)
    onChange(html)
    if (onImagesChange) {
      const extracted = extractImagesFromHtml(html)
      console.log('[Quill] Extracted images:', extracted.length)
      onImagesChange(extracted)
    }
    // Process base64 images with a small delay to ensure DOM is updated
    setTimeout(() => {
      void processBase64Images()
    }, 50)
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white w-full">
      {isUploading && (
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-b">
          Загрузка изображения...
        </div>
      )}
      <style>{`
        .quill-editor-container .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #d1d5db !important;
        }
        .quill-editor-container .ql-container {
          border: none !important;
          font-size: 1rem;
        }
        .quill-editor-container .ql-editor {
          min-height: 200px;
          padding: 1rem;
        }
        .quill-editor-container .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }
      `}</style>
      <div className="quill-editor-container w-full">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          placeholder={placeholder}
          readOnly={disabled || isUploading}
        />
      </div>
    </div>
  )
}
