import { UserInfoPopover } from "@/components/shared/user-info-popover"
import { Button } from "@/components/ui/button"
import { navigationLinks } from "@/constants"
import { PenLine, Star } from "lucide-react"
import Link from "next/link"

export const LeftSidebar = () => {
  return (
    <section className="sticky top-0 flex h-screen w-[20%] flex-col items-stretch px-3 max-lg:items-center">
      <div className="mt-4 flex h-full flex-col space-y-4 max-lg:items-center">
        <Link href={"/"} className="px-4 py-2 text-xl">
          <Star />
        </Link>

        {navigationLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="flex w-fit items-center space-x-4 rounded-3xl px-4 py-2 text-xl transition duration-200 hover:bg-foreground/10"
          >
            <div>{link.icon}</div>
            <div className="max-lg:hidden">{link.title}</div>
          </Link>
        ))}

        <Button className="w-full rounded-full bg-sky-500 px-5 py-6 text-xl hover:bg-sky-600 max-lg:hidden">
          Publier
        </Button>

        <button className="w-fit rounded-full bg-sky-500 p-3 text-xl transition hover:bg-sky-600 lg:hidden">
          <PenLine />
        </button>
      </div>

      <UserInfoPopover />
    </section>
  )
}
