"use client"

import { useState } from "react"
import { api } from "../utils/api"

interface BecomeSellerBlockProps {
  onSuccess?: () => void
}

export default function BecomeSellerBlock({ onSuccess }: BecomeSellerBlockProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleBecomeSeller = async () => {
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const result = await api.becomeSeller()
      setSuccess(true)

      // Обновляем профиль пользователя в localStorage
      if (result && result.role) {
        try {
          const userStr = localStorage.getItem("user")
          if (userStr) {
            const user = JSON.parse(userStr)
            user.role = result.role
            localStorage.setItem("user", JSON.stringify(user))
          }
        } catch {}
      }

      // Вызываем callback для обновления UI
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось стать продавцом")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Хочешь продать машину?</h2>
          <p className="text-gray-600">Тогда стань продавцом и размещай свои объявления на нашей платформе</p>
        </div>
        <div className="flex-shrink-0">
          {error && (
            <div className="text-red-600 text-sm mb-2 text-right">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm mb-2 text-right">Спасибо! Ваш статус обновлен</div>
          )}
          <button
            onClick={handleBecomeSeller}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            {loading ? "Загрузка..." : "Стать продавцом"}
          </button>
        </div>
      </div>
    </div>
  )
}
