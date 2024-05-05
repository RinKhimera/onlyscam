import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { navigationLinks } from "@/constants"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs"
import { EllipsisVertical, PenLine, Star } from "lucide-react"
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

      <Popover>
        <PopoverTrigger asChild>
          <button className="mb-4 flex w-full items-center justify-between rounded-full p-2 transition duration-200 hover:bg-foreground/10 max-lg:w-fit max-lg:justify-center">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="text-left text-sm max-lg:hidden">
                <div className="truncate">TypeScript Enthusiast</div>
                <div className="text-muted-foreground">@rin_khimera</div>
              </div>
            </div>
            <div className="max-lg:hidden">
              <EllipsisVertical />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent side="top">
          <div className="flex flex-col items-center gap-2">
            <SignedIn>
              {/* Mount the UserButton component */}
              <UserButton />
            </SignedIn>

            <SignedOut>
              {/* Signed out users get sign in button */}
              <SignInButton />
            </SignedOut>

            <SignedIn>
              <SignOutButton>Se déconnecter</SignOutButton>
            </SignedIn>
          </div>
        </PopoverContent>
      </Popover>
    </section>
  )
}
