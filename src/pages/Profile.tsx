"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import BecomeSellerBlock from "../components/BecomeSellerBlock"
import CreatePublicationModal from "../components/CreatePublicationModal"
import PublicationCard from "../components/PublicationCard"
import { api } from "../utils/api"
import type { Publication } from "../types"
import { PublicationFilterType } from "../types"
import { uploadFileToProject } from "../utils/fileUploadHelper"

export default function Profile() {
  const navigate = useNavigate()
  const token = useMemo(
    () =>
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token"),
    []
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [avatarUrl, setAvatarUrl] = useState<string | null>("")
  const [userRole, setUserRole] = useState<string | undefined>(undefined)

  const [myPublications, setMyPublications] = useState<Publication[]>([])
  const [publicationsLoading, setPublicationsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>(PublicationFilterType.ALL)

  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changing, setChanging] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) {
      navigate("/sign-in")
      return
    }

    // Initialize from localStorage immediately for better UX
    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const u = JSON.parse(raw)
        setFirstName(u.firstName || u.name || "")
        setLastName(u.lastName || "")
        setEmail(u.email)
        setAvatarUrl(u.avatarUrl || null)
        setUserRole(u.role)
      }
    } catch {}

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const u = await api.getProfile()
        setFirstName(u.firstName || u.name || "")
        setLastName(u.lastName || "")
        setEmail(u.email)
        setAvatarUrl(u.avatarUrl || null)
        setUserRole(u.role)

        // persist latest user for Navbar
        try {
          localStorage.setItem("user", JSON.stringify(u))
        } catch {}

        setError(null)

        // Если пользователь - продавец, загружаем его публикации
        if (u.role === "ROLE_SELLER") {
          fetchMyPublications()
        }
      } catch (err) {
        setError("Не удалось загрузить профиль")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate, token])

  useEffect(() => {
    if (userRole === "ROLE_SELLER") {
      fetchMyPublications(selectedFilter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, userRole])

  const fetchMyPublications = async (filterType: string = selectedFilter) => {
    try {
      setPublicationsLoading(true)
      const pubs = await api.getMyPublicationsByFilter(filterType)
      setMyPublications(pubs)
    } catch (err) {
      console.error("Failed to fetch publications:", err)
    } finally {
      setPublicationsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!token) return
    try {
      setSaving(true)
      setSaveMessage(null)
      const updated = await api.updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        avatarUrl: avatarUrl || null,
      })
      try {
        localStorage.setItem("user", JSON.stringify(updated))
      } catch {}
      setSaveMessage("Профиль успешно обновлён")
    } catch (err: any) {
      setSaveMessage(err?.message || "Ошибка при сохранении профиля")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return
    if (newPassword.length < 6) {
      setPasswordMessage("Новый пароль должен быть не менее 6 символов")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("Пароль и подтверждение не совпадают")
      return
    }

    try {
      setChanging(true)
      setPasswordMessage(null)
      await api.changePassword({ currentPassword, newPassword })
      setPasswordMessage("Пароль успешно изменён")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setPasswordMessage(err?.message || "Не удалось изменить пароль")
    } finally {
      setChanging(false)
    }
  }

  const handlePublicationCreated = () => {
    fetchMyPublications()
  }

  const handleBecomeSellerSuccess = async () => {
    // Перезагружаем профиль после становления продавцом
    try {
      const u = await api.getProfile()
      setUserRole(u.role)
      try {
        localStorage.setItem("user", JSON.stringify(u))
      } catch {}

      if (u.role === "ROLE_SELLER") {
        fetchMyPublications()
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setSaveMessage('Пожалуйста, выберите файл изображения')
      return
    }

    // Проверка размера (максимум 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setSaveMessage('Размер файла не должен превышать 5 МБ')
      return
    }

    setUploadingAvatar(true)
    setSaveMessage(null)

    try {
      const result = await uploadFileToProject(
        file,
        'kolesa',
        'avatar',
        'https://api-todo.javazhan.tech'
      )

      setAvatarUrl(result.url)
      setSaveMessage('Аватар загружен! Не забудьте сохранить изменения.')
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error)
      setSaveMessage(error instanceof Error ? error.message : 'Не удалось загрузить аватар')
    } finally {
      setUploadingAvatar(false)
      // Сбрасываем input для возможности загрузить тот же файл снова
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const handleDeletePublication = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту публикацию?")) return

    try {
      await api.deletePublication(id)
      setMyPublications(myPublications.filter(p => p.id !== id))
    } catch (err) {
      alert("Не удалось удалить публикацию")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/home" className="text-sm text-gray-600 hover:text-gray-800">← Назад</Link>
          <h1 className="text-3xl font-bold">Мой профиль</h1>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">Загрузка...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">{error}</div>
        ) : (
          <div className="space-y-8">
            <section className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-xl font-semibold mb-4">Данные аккаунта</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Имя</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Иван"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Фамилия</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Иванов"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-2">Аватар</label>
                  <div className="flex items-start gap-4">
                    {/* Avatar Preview */}
                    <div className="flex-shrink-0">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
                        >
                          {uploadingAvatar ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Загрузка...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Загрузить фото
                            </>
                          )}
                        </button>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl(null)}
                            disabled={uploadingAvatar}
                            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 bg-white rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            Удалить фото
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Рекомендуемый формат: JPG, PNG. Максимальный размер: 5 МБ
                      </p>

                      {/* Hidden file input */}
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <p className="mt-1 text-gray-900">{email}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                {saveMessage && (
                  <span className={`text-sm ${saveMessage.includes("усп") ? "text-green-600" : "text-red-600"}`}>{saveMessage}</span>
                )}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow border p-6">
              <h2 className="text-xl font-semibold mb-4">Смена пароля</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Текущий пароль</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Новый пароль</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Подтверждение пароля</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={changing}
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary bg-white rounded-md hover:bg-primary/5 disabled:opacity-50"
                >
                  {changing ? "Сохранение..." : "Изменить пароль"}
                </button>
                {passwordMessage && (
                  <span className={`text-sm ${passwordMessage.includes("усп") ? "text-green-600" : "text-red-600"}`}>{passwordMessage}</span>
                )}
              </div>
            </section>

            {userRole === "ROLE_SELLER" && (
              <section className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Мои публикации</h2>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + Создать публикацию
                  </button>
                </div>

                <div className="flex gap-2 mb-6 border-b pb-4">
                  <button
                    onClick={() => setSelectedFilter(PublicationFilterType.ALL)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedFilter === PublicationFilterType.ALL
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setSelectedFilter(PublicationFilterType.PUBLISHED)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedFilter === PublicationFilterType.PUBLISHED
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Опубликованные
                  </button>
                  <button
                    onClick={() => setSelectedFilter(PublicationFilterType.UNPUBLISHED)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedFilter === PublicationFilterType.UNPUBLISHED
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Неопубликованные
                  </button>
                </div>

                {publicationsLoading ? (
                  <div className="text-center py-8 text-gray-500">Загрузка публикаций...</div>
                ) : myPublications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">
                      {selectedFilter === PublicationFilterType.ALL
                        ? "У вас пока нет публикаций"
                        : selectedFilter === PublicationFilterType.PUBLISHED
                        ? "У вас нет опубликованных публикаций"
                        : "У вас нет неопубликованных публикаций"}
                    </p>
                    {selectedFilter === PublicationFilterType.ALL && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Создать первую публикацию
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPublications.map((publication) => (
                      <div key={publication.id} className="relative">
                        <PublicationCard publication={publication} />
                        <button
                          onClick={() => handleDeletePublication(publication.id)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {userRole !== "ROLE_SELLER" && (
              <BecomeSellerBlock onSuccess={handleBecomeSellerSuccess} />
            )}
          </div>
        )}
      </main>

      <CreatePublicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePublicationCreated}
      />
    </div>
  )
}
