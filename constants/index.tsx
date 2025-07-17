import {
  Bell,
  Bookmark,
  CircleUserRound,
  Home,
  Mail,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavLink {
  id: string
  title: string
  href: string | ((username?: string) => string)
  icon: LucideIcon
  badge?: (counts: {
    unreadMessages: number
    unreadNotifications: number
  }) => number | null
  requiresAuth?: boolean
  mobileQuickAccess?: boolean
}

export const navigationLinks: NavLink[] = [
  {
    id: "home",
    title: "Accueil",
    href: "/",
    icon: Home,
    mobileQuickAccess: true,
  },
  {
    id: "notifications",
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: (counts) =>
      counts.unreadNotifications > 0 ? counts.unreadNotifications : null,
    requiresAuth: true,
    mobileQuickAccess: true,
  },
  {
    id: "messages",
    title: "Messages",
    href: "/messages",
    icon: Mail,
    badge: (counts) =>
      counts.unreadMessages > 0 ? counts.unreadMessages : null,
    requiresAuth: true,
    mobileQuickAccess: true,
  },
  {
    id: "collections",
    title: "Collections",
    href: "/collections",
    icon: Bookmark,
    requiresAuth: true,
  },
  {
    id: "subscriptions",
    title: "Abonnements",
    href: "/user-lists",
    icon: Users,
    requiresAuth: true,
  },
  {
    id: "profile",
    title: "Profil",
    href: (username?: string) => (username ? `/${username}` : "/profile"),
    icon: CircleUserRound,
    requiresAuth: true,
  },
]
