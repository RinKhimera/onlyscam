"use client"

import { useQuery } from "convex/react"
import { RotateCcw, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { SuggestionCard } from "@/components/shared/suggestion-card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { api } from "@/convex/_generated/api"

// Fonction pour diviser le tableau en sous-tableaux de taille n
const chunkArray = (array: any[], size: number): any[][] => {
  const chunkedArr: any[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size))
  }
  return chunkedArr
}

export const SuggestionSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // Debounce pour éviter trop de requêtes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // API Carousel pour suivre la pagination
  useEffect(() => {
    if (!carouselApi) {
      return
    }

    setCurrent(carouselApi.selectedScrollSnap())

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  // Récupérer les créateurs suggérés (randomisés)
  const suggestedCreators = useQuery(api.users.getSuggestedCreators, {
    refreshKey: refreshKey,
  })

  // Fonction pour rafraîchir les suggestions
  const refreshSuggestions = () => {
    setRefreshKey((prev) => prev + 1)
    setCurrent(0) // Reset carousel position
    carouselApi?.scrollTo(0)
  }

  // Query pour la recherche
  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedSearchTerm.trim()
      ? { searchTerm: debouncedSearchTerm.trim() }
      : "skip",
  )

  // Diviser suggestedCreators en sous-tableaux de 3 éléments
  const userGroups = chunkArray(suggestedCreators || [], 3)

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
          <div className="my-4">
            {suggestedCreators === undefined ? (
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Suggestions</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled
                      className="h-8 w-8 rounded-full"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Skeleton loading cards */}
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="relative mb-2.5 h-[140px] animate-pulse rounded-lg"
                    >
                      <div className="h-full w-full rounded-lg bg-muted"></div>
                      <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
                        <div className="relative size-24 rounded-full border-2 bg-muted"></div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-lg bg-black/30">
                        <div className="ml-[120px] flex flex-col justify-center gap-2 pr-4 pt-3">
                          <div className="h-4 w-32 rounded bg-gray-400/50"></div>
                          <div className="h-3 w-24 rounded bg-gray-400/30"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !suggestedCreators || suggestedCreators.length === 0 ? (
              <div className="flex items-center justify-center">
                <div className="rounded-lg border p-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 font-medium text-foreground">
                    Aucune suggestion disponible
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Revenez plus tard pour découvrir de nouveaux créateurs
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Carousel className="w-full" setApi={setCarouselApi}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-xl font-bold">Suggestions</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={refreshSuggestions}
                        className="h-8 w-8 rounded-full hover:bg-primary"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      {userGroups.length > 1 && (
                        <>
                          <CarouselPrevious className="static h-8 w-8 translate-y-0 hover:bg-primary" />
                          <CarouselNext className="static h-8 w-8 translate-y-0 hover:bg-primary" />
                        </>
                      )}
                    </div>
                  </div>

                  <CarouselContent className="-ml-2 md:-ml-4">
                    {userGroups.map((group, index) => (
                      <CarouselItem key={index} className="pl-2 md:pl-4">
                        <div className="space-y-3">
                          {group.map((user) => (
                            <SuggestionCard key={user._id} user={user} />
                          ))}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  {/* Indicateurs de pagination modernes */}
                  {userGroups.length > 1 && (
                    <div className="mt-3 flex justify-center gap-2">
                      {userGroups.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => carouselApi?.scrollTo(index)}
                          className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                            index === current
                              ? "bg-primary"
                              : "bg-muted hover:bg-muted-foreground/50"
                          }`}
                          aria-label={`Aller à la page ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </Carousel>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
