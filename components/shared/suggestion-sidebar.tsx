import { SuggestionCard } from "@/components/shared/suggestion-card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { api } from "@/convex/_generated/api"
import { fetchQuery } from "convex/nextjs"
import { Search } from "lucide-react"

// Fonction pour diviser le tableau en sous-tableaux de taille n
const chunkArray = (array: any[], size: number): any[][] => {
  const chunkedArr: any[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size))
  }
  return chunkedArr
}

export const SuggestionSidebar = async ({
  authToken,
}: {
  authToken: string | undefined
}) => {
  const users = await fetchQuery(api.users.getUsers, undefined, {
    token: authToken,
  })

  const suggestedUsers = users?.filter((user) => Boolean(user.username))

  // Diviser suggestedUsers en sous-tableaux de 3 éléments
  const userGroups = chunkArray(suggestedUsers || [], 3)

  return (
    <section className="sticky top-0 h-screen w-[30%] items-stretch overflow-auto pl-6 pr-2 max-lg:hidden">
      <div className="mt-3">
        <div className="relative h-full w-full">
          <label
            htmlFor="searchBox"
            className="absolute left-0 top-0 flex h-full items-center justify-center p-4"
          >
            <Search />
          </label>

          <input
            id="searchBox"
            type="text"
            placeholder="Rechercher sur FanTribe"
            className="h-full w-full rounded-xl border-none bg-muted py-4 pl-14 pr-4 outline-none"
          />
        </div>

        <Carousel className="static my-4 w-full">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Suggestions</h3>

            <div className="flex gap-2">
              <CarouselPrevious
                variant="ghost"
                className="static translate-y-0"
              />
              <CarouselNext variant="ghost" className="static translate-y-0" />
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
      </div>
    </section>
  )
}
