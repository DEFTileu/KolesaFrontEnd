"use client"

import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import { api } from "../utils/api"

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

  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changing, setChanging] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

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
        // persist latest user for Navbar
        try {
          localStorage.setItem("user", JSON.stringify(u))
        } catch {}
        setError(null)
      } catch (err) {
        setError("Не удалось загрузить профиль")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate, token])

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
                  <label className="block text-sm text-gray-600 mb-1">Avatar URL</label>
                  <input
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={avatarUrl || ""}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  {avatarUrl ? (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                      <span className="text-xs text-gray-500">Предпросмотр</span>
                    </div>
                  ) : null}
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
          </div>
        )}
      </main>
    </div>
  )
}
