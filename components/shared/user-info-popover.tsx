import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Doc } from "@/convex/_generated/dataModel"
import { SignOutButton, SignedIn, UserButton } from "@clerk/nextjs"
import {
  BookmarkPlus,
  EllipsisVertical,
  Home,
  LogOut,
  Settings,
} from "lucide-react"
import Link from "next/link"

export const UserInfoPopover = ({
  currentUser,
}: {
  currentUser: Doc<"users"> | undefined
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="mb-4 flex w-full items-center justify-between rounded-full p-2 transition duration-200 hover:bg-foreground/10 max-lg:w-fit max-lg:justify-center">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage
                src={currentUser?.image}
                alt={currentUser?.username}
              />
              <AvatarFallback className="size-11">
                <div className="animate-pulse rounded-full bg-gray-500"></div>
              </AvatarFallback>
            </Avatar>

            <div className="text-left text-sm max-lg:hidden">
              <div className="truncate">{currentUser?.name}</div>
              <div className="text-muted-foreground">
                @{currentUser?.username}
              </div>
            </div>
          </div>

          <div className="max-lg:hidden">
            <EllipsisVertical />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" className="w-60">
        <DropdownMenuGroup className="font-semibold text-white">
          <DropdownMenuLabel className="flex flex-col gap-1">
            {/* Mount the UserButton component */}
            <UserButton />

            <Link
              href={currentUser ? `/${currentUser.username}` : ""}
              className="w-fit text-base hover:underline"
            >
              {currentUser?.name}
            </Link>

            <Link
              href={currentUser ? `/${currentUser.username}` : ""}
              className="w-fit font-normal text-muted-foreground hover:text-blue-500 hover:underline"
            >
              @{currentUser?.username}
            </Link>

            <div>
              {currentUser?.following?.length} abonnements |{" "}
              {currentUser?.followers?.length} fans
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={"/"}
              className="flex w-full items-center space-x-2 rounded-3xl"
            >
              <div>
                <Home size={20} />
              </div>
              <div className="max-lg:hidden">Mon Profil</div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link
              href={"/collections"}
              className="flex w-full items-center space-x-2 rounded-3xl"
            >
              <div>
                <BookmarkPlus size={20} />
              </div>
              <div className="max-lg:hidden">Collections</div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href={"/collections"}
              className="flex w-full items-center space-x-2 rounded-3xl"
            >
              <div>
                <Settings size={20} />
              </div>
              <div className="max-lg:hidden">Paramètres</div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <SignOutButton>
              <div className="flex w-full cursor-pointer items-center space-x-2 rounded-3xl">
                <div>
                  <LogOut size={20} />
                </div>
                <div>Se déconnecter</div>
              </div>
            </SignOutButton>
          </DropdownMenuItem>

          {/* <DropdownMenuItem>{currentUser?.name}</DropdownMenuItem>

          <SignedIn>
            <SignOutButton>Se déconnecter</SignOutButton>
          </SignedIn> */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const UserInfoSkeleton = () => {
  return (
    <button className="mb-4 flex w-full items-center justify-between rounded-full p-2 transition duration-200 hover:bg-foreground/10 max-lg:w-fit max-lg:justify-center">
      <div className="flex items-center space-x-2">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-2 max-lg:hidden">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </div>
    </button>
  )
}
