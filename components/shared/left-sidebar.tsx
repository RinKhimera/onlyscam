"use client"

import { UserInfoPopover } from "@/components/shared/user-info-popover"
import { Button } from "@/components/ui/button"
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import {
  Bell,
  Bookmark,
  Hash,
  Home,
  Mail,
  PenLine,
  Star,
  UserRound,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const LeftSidebar = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const navigationLinks = [
    { title: "Accueil", href: "/", icon: <Home /> },
    {
      title: "Explorer",
      href: "/explore",
      icon: <Hash />,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <Mail />,
    },
    {
      title: "Collections",
      href: "/collections",
      icon: <Bookmark />,
    },
    {
      title: "Profile",
      href: currentUser ? `/${currentUser.username}` : "",
      icon: <UserRound />,
    },
  ]

  const pathname = usePathname()
  console.log(pathname)

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
            className={cn(
              "flex w-fit items-center space-x-4 rounded-3xl px-4 py-2 text-xl transition duration-200 hover:bg-foreground/10",
              { "text-muted-foreground": pathname !== link.href },
            )}
          >
            <div>{link.icon}</div>
            <div className="max-lg:hidden">{link.title}</div>
          </Link>
        ))}

        <Button className="w-full rounded-full bg-primary px-5 py-6 text-xl hover:bg-primary/80 max-lg:hidden">
          Publier
        </Button>

        <button className="w-fit rounded-full bg-primary p-3 text-xl transition hover:bg-primary/80 lg:hidden">
          <PenLine />
        </button>
      </div>

      <UserInfoPopover currentUser={currentUser} />
    </section>
  )
}
