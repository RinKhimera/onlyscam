"use client"

import { useQuery } from "convex/react"
import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { SuggestionCard } from "@/components/shared/suggestion-card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { api } from "@/convex/_generated/api"
import { useCurrentUser } from "@/hooks/useCurrentUser"

// Fonction pour diviser le tableau en sous-tableaux de taille n
const chunkArray = (array: any[], size: number): any[][] => {
  const chunkedArr: any[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size))
  }
  return chunkedArr
}

export const SuggestionSidebar = () => {
  const { currentUser } = useCurrentUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Query pour les utilisateurs suggérés par défaut
  const users = useQuery(api.users.getUsers)

  // Query pour la recherche
  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedSearchTerm.trim()
      ? { searchTerm: debouncedSearchTerm.trim() }
      : "skip",
  )

  const suggestedUsers = users?.filter((user) => Boolean(user.username))

  // Diviser suggestedUsers en sous-tableaux de 3 éléments
  const userGroups = chunkArray(suggestedUsers || [], 3)

  const clearSearch = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
  }

  const isSearching = debouncedSearchTerm.trim().length > 0

  return (
    <section className="sticky top-0 h-screen w-[30%] items-stretch overflow-auto pl-6 pr-2 max-lg:hidden">
      <div className="mt-3">
        {/* Barre de recherche */}
        <div className="relative h-12 w-full">
          <label
            htmlFor="searchBox"
            className="absolute left-0 top-0 flex h-full items-center justify-center p-4"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </label>

          <input
            id="searchBox"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher sur FanTribe"
            className="h-full w-full rounded-xl border-none bg-muted py-4 pl-14 pr-12 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />

          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Résultats de recherche */}
        {isSearching ? (
          <div className="mt-4">
            <h3 className="mb-4 text-xl font-bold">
              Résultats pour &quot;{debouncedSearchTerm}&quot;
            </h3>

            {searchResults === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Recherche en cours...
                  </p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aucun utilisateur trouvé
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Essayez avec un autre nom ou username
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults?.map((user) => (
                  <SuggestionCard
                    key={user._id}
                    user={user}
                    searchTerm={debouncedSearchTerm}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Suggestions par défaut */
          <Carousel className="static my-4 w-full">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Suggestions</h3>

              <div className="flex gap-2">
                <CarouselPrevious
                  variant="ghost"
                  className="static translate-y-0"
                />
                <CarouselNext
                  variant="ghost"
                  className="static translate-y-0"
                />
              </div>
            </div>

            <CarouselContent>
              {userGroups.map((group, index) => (
                <CarouselItem key={index}>
                  {group.map((user) => (
                    <SuggestionCard key={user._id} user={user} />
                  ))}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>
    </section>
  )
}
