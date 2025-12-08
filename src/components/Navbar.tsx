"use client"

import { Link, useNavigate } from "react-router-dom"
import { useMemo } from "react"

export default function Navbar() {
  const navigate = useNavigate()
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/sign-in")
  }

  const getInitials = () => {
    if (!user) return "U"
    const first = user.firstName?.[0] || user.name?.split(" ")?.[0]?.[0] || user.username?.[0] || "U"
    const last = user.lastName?.[0] || user.name?.split(" ")?.[1]?.[0] || ""
    return `${first}${last}`.toUpperCase()
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/home" className="text-2xl font-bold text-primary hover:opacity-80">Publications</Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {getInitials()}
                    </div>
                  )}
                  <span className="text-sm text-gray-700 hidden sm:block">
                    {user.firstName || user.name || user.username} {user.lastName || ""}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}
