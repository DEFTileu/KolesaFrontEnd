"use client"

import { useRouter } from "next/navigation"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CalendarIcon, ImageIcon } from "lucide-react"

interface PublicationCardProps {
  publication: {
    id: string
    title: string
    description: string
    author: {
      firstName: string
      lastName: string
    }
    images?: Array<{
      id: string
      url: string
    }>
    createdAt: string
  }
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const handleClick = () => {
    router.push(`/publication/${publication.id}`)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden" onClick={handleClick}>
      {/* Cover Image */}
      {publication.images && publication.images.length > 0 ? (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={
              publication.images[0].url ||
              `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(publication.title)}`
            }
            alt={publication.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
        </div>
      )}

      <CardHeader>
        <h3 className="text-xl font-semibold line-clamp-2 text-balance group-hover:text-primary transition-colors">
          {publication.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty mt-2">{publication.description}</p>
      </CardHeader>

      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs">
              {getInitials(publication.author.firstName, publication.author.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {publication.author.firstName} {publication.author.lastName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="w-3 h-3" />
          <span>{formatDate(publication.createdAt)}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
