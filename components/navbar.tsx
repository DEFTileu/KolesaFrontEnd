"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOutIcon, HomeIcon } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [mounted])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/sign-in")
  }

  const getInitials = () => {
    if (!user) return "U"
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
  }

  if (!mounted) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">Kolesa Publications</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <HomeIcon className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Kolesa Publications</span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Open profile">
                <Avatar className="w-8 h-8">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt="User avatar" />
                  ) : null}
                  <AvatarFallback className="text-sm">{getInitials()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user.firstName} {user.lastName}
                </span>
              </Link>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
