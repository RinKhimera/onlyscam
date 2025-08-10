"use client"

import { useConvexAuth, useQuery } from "convex/react"
import { PenLine } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React from "react"
import { UserInfoPopover } from "@/components/shared/user-info-popover"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { NavLink, navigationLinks } from "@/constants"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { MobileMenu } from "./mobile-menu"

export const LeftSidebar = ({ currentUser }: { currentUser: Doc<"users"> }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()

  const unreadCountsData = useQuery(
    api.notifications.getUnreadCounts,
    isAuthenticated ? undefined : "skip",
  )

  const unreadCounts = {
    unreadMessages: unreadCountsData?.unreadMessagesCount || 0,
    unreadNotifications: unreadCountsData?.unreadNotificationsCount || 0,
  }

  const getHref = (link: NavLink) => {
    if (typeof link.href === "function") {
      return link.href(currentUser?.username)
    }
    return link.href
  }

  // Liens réservés aux superusers
  const filteredNavigationLinks = navigationLinks.filter((link) => {
    const superuserOnlyLinks = ["superuser", "messages"]

    if (superuserOnlyLinks.includes(link.id)) {
      return currentUser?.accountType === "SUPERUSER"
    }
    return true
  })

  return (
    <>
      {/* Navigation Desktop */}
      <section className="sticky top-0 flex h-screen w-[20%] flex-col items-stretch px-3 max-lg:w-[15%] max-lg:items-end max-[500px]:hidden">
        <div className="mt-4 flex h-full flex-col space-y-5 font-semibold max-lg:items-center">
          {filteredNavigationLinks.map((link) => {
            const IconComponent = link.icon
            const badgeValue = link.badge ? link.badge(unreadCounts) : null
            const href = getHref(link)

            return (
              <Link
                key={`desktop-${link.id}`}
                href={href}
                className={cn(
                  buttonVariants({ variant: "navLink" }),
                  "flex w-fit items-center space-x-4 rounded-3xl text-xl transition hover:bg-foreground/10 hover:text-primary",
                  { "text-muted-foreground": pathname !== href },
                )}
              >
                <div className="relative">
                  <IconComponent className="size-6" />
                  {badgeValue && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {badgeValue}
                    </Badge>
                  )}
                </div>
                <div className="max-lg:hidden">{link.title}</div>
              </Link>
            )
          })}

          {/* Bouton desktop */}
          <Button
            className="w-full rounded-full bg-primary px-5 py-6 text-xl hover:bg-primary/80 max-lg:hidden"
            onClick={() => {
              if (
                currentUser?.accountType === "CREATOR" ||
                currentUser?.accountType === "SUPERUSER"
              ) {
                router.push("/new-post")
              } else {
                router.push("/be-creator")
              }
            }}
          >
            <span>Publier</span>
          </Button>

          {/* Bouton mobile/tablet */}
          <Button
            className="w-fit rounded-full bg-primary p-3 text-xl transition hover:bg-primary/80 lg:hidden"
            onClick={() => {
              if (
                currentUser?.accountType === "CREATOR" ||
                currentUser?.accountType === "SUPERUSER"
              ) {
                router.push("/new-post")
              } else {
                router.push("/be-creator")
              }
            }}
          >
            <PenLine className="size-6" />
          </Button>
        </div>
        {currentUser && <UserInfoPopover currentUser={currentUser} />}
      </section>

      {/* Navigation Mobile avec Sheet */}
      {isAuthenticated && <MobileMenu />}
    </>
  )
}
