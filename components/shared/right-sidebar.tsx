import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"

export const RightSidebar = () => {
  return (
    <section className="sticky top-0 flex h-screen w-[30%] flex-col items-stretch px-6">
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
            placeholder="Rechercher sur OnlyScam"
            className="h-full w-full rounded-xl border-none bg-muted py-4 pl-14 pr-4 outline-none"
          />
        </div>
      </div>
      <div className="my-4 flex flex-col rounded-xl bg-muted">
        <h3 className="my-4 px-4 text-xl font-bold">Suggestions</h3>
        <div>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="transition duration-200 last:rounded-b-xl hover:bg-muted-foreground/15"
            >
              <button className="flex h-full w-full items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>

                  <div className="text-left text-sm">
                    <div className="truncate">TypeScript Enthusiast</div>
                    <div className="text-muted-foreground">@rin_khimera</div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
