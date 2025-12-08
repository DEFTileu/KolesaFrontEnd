"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient, type CarPublication } from "@/lib/api-client"
import Link from "next/link"
import Image from "next/image"

function ProfileContent() {
  const { user, token, setUserInContext } = useAuth()
  const [userCars, setUserCars] = useState<CarPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserCars = async () => {
      if (!token) return

      try {
        setLoading(true)
        const data = await apiClient.getUserCars(token)
        setUserCars(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cars")
        console.error("[v0] Error fetching user cars:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserCars()
  }, [token])

  useEffect(() => {
    // Keep form fields in sync if user gets refreshed
    setFirstName(user?.firstName || "")
    setLastName(user?.lastName || "")
    setAvatarUrl(user?.avatarUrl || "")
  }, [user])

  const handleSaveProfile = async () => {
    if (!token) return
    try {
      setSavingProfile(true)
      setProfileMessage(null)
      const updated = await apiClient.updateProfile(
        { firstName: firstName || undefined, lastName: lastName || undefined, avatarUrl: avatarUrl || null },
        token
      )
      setUserInContext(updated)
      setProfileMessage("Profile updated successfully")
    } catch (err) {
      setProfileMessage(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!token) return
    if (newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match")
      return
    }
    try {
      setChangingPassword(true)
      setPasswordMessage(null)
      await apiClient.changePassword({ currentPassword, newPassword }, token)
      setPasswordMessage("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setPasswordMessage(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">← Back to Home</Button>
            </Link>
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-muted-foreground">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">Avatar URL</label>
                  <Input value={avatarUrl || ""} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
                  {avatarUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      <Image src={avatarUrl} alt="Avatar Preview" width={48} height={48} className="rounded-full object-cover" />
                      <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Email Address</label>
                  <p className="text-lg font-medium mt-1 break-all">{user?.email}</p>
                </div>

                {user?.createdAt && (
                  <div>
                    <label className="text-sm text-muted-foreground">Member Since</label>
                    <p className="text-lg font-medium mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm text-muted-foreground">User ID</label>
                  <p className="text-lg font-medium mt-1 font-mono text-sm break-all">{user?.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? "Saving..." : "Save Changes"}
                </Button>
                {profileMessage && (
                  <span className={`text-sm ${profileMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {profileMessage}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" className="bg-transparent">
                  {changingPassword ? "Changing..." : "Change Password"}
                </Button>
                {passwordMessage && (
                  <span className={`text-sm ${passwordMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
                    {passwordMessage}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Car Listings</h2>
              <Link href="/publications">
                <Button variant="outline">Browse All Cars</Button>
              </Link>
            </div>

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="text-red-800">{error}</p>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Loading your listings...</p>
                </CardContent>
              </Card>
            ) : userCars.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted any cars yet.</p>
                  <Button>Create New Listing</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCars.map((car) => (
                  <Card key={car.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative w-full h-40 bg-muted">
                      {car.imageUrl ? (
                        <Image
                          src={car.imageUrl || "/placeholder.svg"}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{car.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Brand</p>
                          <p className="font-semibold">{car.brand}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Year</p>
                          <p className="font-semibold">{car.year}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t pt-3">
                        <div>
                          <p className="text-muted-foreground text-sm">Price</p>
                          <p className="text-xl font-bold">${car.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-sm">Condition</p>
                          <p className="font-semibold">{car.condition}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Link href={`/publications/${car.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Manage your account preferences and settings.</p>
              <Button variant="outline" className="w-full bg-transparent">
                Password Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
