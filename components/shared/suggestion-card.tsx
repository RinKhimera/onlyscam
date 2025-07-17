"use client"

import { CldImage } from "next-cloudinary"
import Link from "next/link"
import { ProfileImage } from "@/components/shared/profile-image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserProps } from "@/types"

interface SuggestionCardProps {
  user: UserProps
  searchTerm?: string
}

export const SuggestionCard = ({ user, searchTerm }: SuggestionCardProps) => {
  const highlightText = (text: string, term?: string) => {
    if (!term) return text

    const parts = text.split(new RegExp(`(${term})`, "gi"))
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-yellow-800">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  return (
    <div className="relative mb-2.5 h-[140px] rounded-lg">
      <Link href={`/${user?.username}`} className="flex h-full flex-col">
        <div className="flex-1">
          <CldImage
            className="rounded-lg object-cover"
            src={
              (user?.imageBanner as string) ||
              "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
            }
            alt={user?.name as string}
            fill
          />
        </div>

        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
          <Avatar className="relative size-24 overflow-visible border-2">
            {user?.isOnline && (
              <div className="absolute right-1.5 top-0 size-4 rounded-full border-2 border-foreground bg-green-500" />
            )}
            {user?.image ? (
              <ProfileImage
                src={user.image}
                width={200}
                height={200}
                alt={user?.name || "Profile image"}
                className="rounded-full object-cover"
              />
            ) : (
              <AvatarFallback>
                <div className="h-full w-full animate-pulse rounded-full"></div>
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="relative flex flex-1 bg-black/30">
          <div className="ml-[120px] flex flex-col justify-center gap-1 text-white">
            <div className="truncate text-lg font-semibold leading-none">
              {highlightText(user?.name || "Utilisateur", searchTerm)}
            </div>
            <div className="text-sm leading-none">
              @{highlightText(user?.username || "", searchTerm)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
