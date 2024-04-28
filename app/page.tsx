import LeftSidebar from "@/components/shared/left-sidebar"
import { ModeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dot, EllipsisVertical, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        {/* Left sidebar for navigation & header */}
        <LeftSidebar />
        <main className="ml-[290px] flex h-full min-h-screen w-[600px] flex-col border-l border-r border-muted">
          <h1 className="sticky top-0 p-4 text-2xl font-bold backdrop-blur">
            Accueil
          </h1>

          <div className="relative flex items-stretch space-x-3 border-b border-t border-muted px-4 py-5">
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
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex space-x-4 border-b p-4">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-1">
                    <div className="font-bold">TypeScript Enthusiast</div>
                    <div className="text-muted-foreground">@rin_khimera</div>
                    <div>
                      <Dot />
                    </div>
                    <div className="text-muted-foreground">1h</div>
                  </div>

                  <div className="text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Distinctio quibusdam illo minima officiis ipsa, beatae quis
                    eveniet tempore eius eum repellendus deleniti placeat,
                    impedit labore maxime illum. Vero quibusdam, repellendus
                    similique ea odio corrupti laboriosam magni, repellat rem
                    sint aperiam quisquam nihil adipisci fuga vitae praesentium
                    earum doloribus. Quae, adipisci!
                  </div>

                  <div className="aspect-square h-96 w-full rounded-xl bg-slate-400"></div>

                  <div className="flex w-full items-center space-x-2">
                    <div>C</div>
                    <div>R</div>
                    <div>L</div>
                    <div>S</div>
                    <div>SH</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        {/* <section>Right section</section> */}
      </div>
    </div>
  )
}
