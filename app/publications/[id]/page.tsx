"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type CarPublication } from "@/lib/api-client"
import Link from "next/link"
import Image from "next/image"

function CarDetailContent() {
  const { id } = useParams()
  const { token } = useAuth()
  const [car, setCar] = useState<CarPublication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await apiClient.getCarById(id as string, token || undefined)
        setCar(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load car")
        console.error("[v0] Error fetching car:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id, token])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-muted-foreground">Loading car details...</p>
        </main>
      </>
    )
  }

  if (error || !car) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800 mb-4">{error || "Car not found"}</p>
              <Link href="/publications">
                <Button>Back to Marketplace</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  const galleryImages =
    car.images && car.images.length > 0 ? car.images.map((img) => img.fileUrl) : car.imageUrl ? [car.imageUrl] : []
  const currentImage = galleryImages[selectedImageIndex] || "/placeholder.svg"

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <Link href="/publications">
            <Button variant="outline">← Back to Marketplace</Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card className="overflow-hidden">
                <div className="relative w-full h-96 bg-muted">
                  <Image
                    src={currentImage || "/placeholder.svg"}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {galleryImages.length > 1 && (
                  <CardContent className="pt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {galleryImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded border-2 transition-colors ${
                            selectedImageIndex === index ? "border-primary" : "border-muted"
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`View ${index + 1}`}
                            fill
                            className="object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Title and Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl text-balance">{car.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg text-muted-foreground leading-relaxed">{car.description}</p>
                  {car.content && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-2">Details</h3>
                      <p className="text-muted-foreground leading-relaxed">{car.content}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specifications Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="text-lg font-semibold">{car.brand}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="text-lg font-semibold">{car.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="text-lg font-semibold">{car.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="text-lg font-semibold">{car.mileage.toLocaleString()} km</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Condition</p>
                      <p className="text-lg font-semibold">{car.condition}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Engine</p>
                      <p className="text-lg font-semibold">{car.engineType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Transmission</p>
                      <p className="text-lg font-semibold">{car.transmission}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="text-lg font-semibold">{car.fuelType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with Price and Seller */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="border-2 border-primary sticky top-20">
                <CardHeader>
                  <CardTitle>Total Price</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-5xl font-bold text-primary text-balance">${car.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Final price including all fees</p>
                  </div>
                  <Button className="w-full" size="lg">
                    Contact Seller
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline" size="lg">
                    Make an Offer
                  </Button>
                </CardContent>
              </Card>

              {/* Seller Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Seller Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Seller Name</p>
                    <p className="text-lg font-semibold">{car.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="text-sm font-medium">{new Date(car.publishedAt).toLocaleDateString()}</p>
                  </div>
                  <Button className="w-full bg-transparent" variant="outline">
                    View Other Listings
                  </Button>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Safety Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>Meet in public places</li>
                    <li>Inspect thoroughly</li>
                    <li>Get pre-purchase inspection</li>
                    <li>Verify documents</li>
                    <li>Never send money upfront</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default function CarDetail() {
  return (
    <ProtectedRoute>
      <CarDetailContent />
    </ProtectedRoute>
  )
}
