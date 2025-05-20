"use client"

import { useConvexAuth, useQuery } from "convex/react"
import {
  Bell,
  Bookmark,
  CircleUserRound,
  Home,
  Mail,
  PenLine,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserInfoPopover } from "@/components/shared/user-info-popover"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

export const LeftSidebar = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const pathname = usePathname()
  const { isAuthenticated } = useConvexAuth()

  const unreadCounts = useQuery(
    api.notifications.getUnreadCounts,
    isAuthenticated ? undefined : "skip",
  ) || {
    unreadMessagesCount: 0,
    unreadNotificationsCount: 0,
  }

  const unreadMessages = unreadCounts?.unreadMessagesCount || 0
  const unreadNotifications = unreadCounts?.unreadNotificationsCount || 0

  const navigationLinks = [
    { title: "Accueil", href: "/", icon: <Home /> },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell />,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <Mail />,
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      title: "Collections",
      href: "/collections",
      icon: <Bookmark />,
    },
    {
      title: "Abonnements",
      href: "/user-lists",
      icon: <Users />,
    },
    {
      title: "Profile",
      href: currentUser ? `/${currentUser.username}` : "",
      icon: <CircleUserRound />,
    },
  ]

  return (
    <>
      {/* Desktop navigation */}
      <section className="sticky top-0 flex h-screen w-[20%] flex-col items-stretch px-3 max-lg:w-[15%] max-lg:items-end max-[500px]:hidden">
        <div className="mt-4 flex h-full flex-col space-y-5 font-semibold max-lg:items-center">
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
              <div className="relative">
                {link.icon}
                {link.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {link.badge}
                  </Badge>
                )}
              </div>
              <div className="max-lg:hidden">{link.title}</div>
            </Link>
          ))}

          <Button
            asChild
            className="w-full rounded-full bg-primary px-5 py-6 text-xl hover:bg-primary/80 max-lg:hidden"
          >
            <Link href="/new-post">Publier</Link>
          </Button>

          <button className="w-fit rounded-full bg-primary p-3 text-xl transition hover:bg-primary/80 lg:hidden">
            <Link href="/new-post">
              <PenLine />
            </Link>
          </button>
        </div>

        <UserInfoPopover currentUser={currentUser} />
      </section>

      {/* Mobile navigation */}
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
              <div className="relative">
                {link.icon}
                {link.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
                  >
                    {link.badge}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
