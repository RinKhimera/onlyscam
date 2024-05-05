import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bookmark, Dot, Heart, MessageCircle } from "lucide-react"

export const MainLayout = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Accueil
      </h1>

      <div className="relative flex items-stretch space-x-3 border-b border-muted px-4 py-5 max-sm:hidden">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex h-full w-full flex-col">
          <input
            type="text"
            placeholder="Partager une publication"
            className="mt-1 h-full w-full border-none bg-transparent text-xl outline-none"
          />
          <div className="flex w-full items-center justify-between">
            <div></div>
            <div>
              <Button className="w-full rounded-full bg-sky-500 px-4 py-2 font-bold hover:bg-sky-600">
                Publier
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex space-x-4 border-b px-4 pb-2 pt-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1 max-[500px]:flex-col max-[500px]:items-start max-[500px]:space-x-0">
                <div className="font-bold">TypeScript Enthusiast</div>
                <div className="flex items-center space-x-1">
                  <div className="text-muted-foreground">@rin_khimera</div>
                  <div className="text-muted-foreground">
                    <Dot />
                  </div>
                  <div className="text-muted-foreground">1h</div>
                </div>
              </div>

              <div className="text-base">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Distinctio quibusdam illo minima officiis ipsa, beatae quis
                eveniet tempore eius eum repellendus deleniti placeat, impedit
                labore maxime illum. Vero quibusdam, repellendus similique ea
                odio corrupti laboriosam magni, repellat rem sint aperiam
                quisquam nihil adipisci fuga vitae praesentium earum doloribus.
                Quae, adipisci!
              </div>

              <div className="mt-2 aspect-square max-h-96 w-auto rounded-xl bg-slate-400"></div>

              <div className="mt-2 flex w-full items-center justify-between">
                <div className="flex w-full items-center space-x-4">
                  <button className="rounded-full p-2 transition hover:bg-pink-600/15 hover:text-rose-500">
                    <Heart size={20} />
                  </button>
                  <button className="rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500">
                    <MessageCircle size={20} />
                  </button>
                </div>

                <button className="rounded-full p-2 transition hover:bg-blue-600/15 hover:text-blue-500">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
