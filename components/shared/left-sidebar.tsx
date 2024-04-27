import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { navigationLinks } from "@/constants"
import { EllipsisVertical, Star } from "lucide-react"
import Link from "next/link"

const LeftSidebar = () => {
  return (
    <section className="fixed flex h-screen w-[275px] flex-col items-stretch">
      <div className="mt-4 flex h-full flex-col items-stretch space-y-4">
        <Link href={"/"} className="px-4 py-2 text-xl">
          <Star />
        </Link>

        {navigationLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="flex w-fit items-center justify-start space-x-4 rounded-3xl px-4 py-2 text-xl transition duration-200 hover:bg-foreground/10"
          >
            <div>{link.icon}</div>
            <div>{link.title}</div>
          </Link>
        ))}

        <Button className="w-full rounded-full bg-sky-500 py-6 text-xl hover:bg-sky-600">
          Publier
        </Button>
      </div>

      <button className="m-4 flex w-full items-center justify-between rounded-full p-4 transition duration-200 hover:bg-foreground/5">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="text-left text-sm">
            <div className="truncate">TypeScript Enthusiast</div>
            <div className="text-muted-foreground">@rin_khimera</div>
          </div>
        </div>
        <div>
          <EllipsisVertical />
        </div>
      </button>
    </section>
  )
}

export default LeftSidebar
