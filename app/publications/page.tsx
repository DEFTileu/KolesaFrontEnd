"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type CarPublication } from "@/lib/api-client"
import Link from "next/link"
import Image from "next/image"

function PublicationsContent() {
  const { user, token } = useAuth()
  const [cars, setCars] = useState<CarPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true)
        const data = await apiClient.getCars(token || undefined)
        setCars(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cars")
        console.error("[v0] Error fetching cars:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [token])

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground">Car Marketplace</h1>
              <p className="text-lg text-muted-foreground">Browse available cars or view your listings</p>
            </div>
            <Link href="/profile">
              <Button>My Listings</Button>
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
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">Loading cars...</p>
            </div>
          ) : cars.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No cars available at the moment.</p>
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Card key={car.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative w-full h-48 bg-muted">
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
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Brand</p>
                        <p className="font-semibold">{car.brand}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Model</p>
                        <p className="font-semibold">{car.model}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Year</p>
                        <p className="font-semibold">{car.year}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mileage</p>
                        <p className="font-semibold">{car.mileage.toLocaleString()} km</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-muted-foreground text-sm">Price</p>
                          <p className="text-2xl font-bold text-foreground">${car.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-sm">Condition</p>
                          <p className="font-semibold">{car.condition}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engine</span>
                          <span className="font-medium">{car.engineType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transmission</span>
                          <span className="font-medium">{car.transmission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fuel</span>
                          <span className="font-medium">{car.fuelType}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{car.description}</p>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Posted by {car.userName}</p>
                        <Link href={`/publications/${car.id}`}>
                          <Button className="w-full">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function Publications() {
  return (
    <ProtectedRoute>
      <PublicationsContent />
    </ProtectedRoute>
  )
}
