"use client"

import { UserInfoPopover } from "@/components/shared/user-info-popover"
import { Button, buttonVariants } from "@/components/ui/button"
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
    <>
      <section className="sticky top-0 flex h-screen w-[20%] flex-col items-stretch px-3 max-lg:w-[15%] max-lg:items-end max-[500px]:hidden">
        <div className="mt-4 flex h-full flex-col space-y-5 font-semibold max-lg:items-center">
          {/* <Link href={"/"} className="px-4 py-2 text-xl">
          <Star />
        </Link> */}

          {navigationLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "navLink" }),
                "flex w-fit items-center space-x-4 rounded-3xl text-xl transition hover:bg-foreground/10 hover:text-primary",
                { "text-muted-foreground": pathname !== link.href },
              )}
            >
              {/* <Button variant={"ghost"} size={"icon"}>
              {link.icon}
            </Button> */}
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

      <section className="fixed bottom-0 z-30 h-14 w-full border-t min-[500px]:hidden">
        <div className="flex h-full justify-between bg-black px-3 font-semibold max-lg:items-center">
          {navigationLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={cn(
                // buttonVariants({ variant: "navLink" }),
                "flex w-fit rounded-3xl text-xl text-muted-foreground transition hover:bg-foreground/10 hover:text-white",
                { "text-primary": pathname === link.href },
              )}
            >
              <div>{link.icon}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
