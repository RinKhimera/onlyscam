import { Bell, Hash, Home, Mail, UserRound } from "lucide-react"

export const navigationLinks = [
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
    title: "Profile",
    href: "/profile",
    icon: <UserRound />,
  },
]
