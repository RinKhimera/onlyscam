import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfileImage } from "@/components/shared/profile-image"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { SignOutButton } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import {
  BookmarkPlus,
  ChevronsUpDown,
  Home,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react"
import Link from "next/link"

export const UserInfoPopover = ({
  currentUser,
}: {
  currentUser: Doc<"users">
}) => {
  const getFollowers = useQuery(api.follows.getFollowers, {
    userId: currentUser._id,
  })

  const getFollowings = useQuery(api.follows.getFollowings, {
    userId: currentUser._id,
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="mb-4 flex w-full items-center justify-between rounded-lg p-3 transition duration-200 hover:bg-foreground/10 data-[state=open]:bg-foreground/10 data-[state=open]:text-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="size-8 rounded-lg">
              {currentUser?.image ? (
                <ProfileImage
                  src={currentUser.image}
                  width={100}
                  height={100}
                  alt={currentUser?.username || "Profile image"}
                />
              ) : (
                <AvatarFallback className="rounded-lg">
                  {currentUser?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {currentUser?.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                @{currentUser?.username}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-[232px] rounded-lg"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              {currentUser?.image ? (
                <ProfileImage
                  src={currentUser.image}
                  width={100}
                  height={100}
                  alt={currentUser?.username || "Profile image"}
                />
              ) : (
                <AvatarFallback className="rounded-lg">
                  {currentUser?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {currentUser?.name}
              </span>
              <span className="truncate text-xs">@{currentUser?.username}</span>
            </div>
          </div>
          <div className="mt-2 px-2 text-sm">
            {getFollowers?.length} fans | {getFollowings?.length} abonnements
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles className="mr-2 size-4" />
            Passer à la version Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/${currentUser?.username}`}>
            <DropdownMenuItem className="cursor-pointer">
              <Home className="mr-2 size-4" />
              Mon Profil
            </DropdownMenuItem>
          </Link>
          <Link href="/collections">
            <DropdownMenuItem className="cursor-pointer">
              <BookmarkPlus className="mr-2 size-4" />
              Collections
            </DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 size-4" />
              Paramètres
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <SignOutButton>
          <DropdownMenuItem className="cursor-pointer">
            <LogOut className="mr-2 size-4" />
            Se déconnecter
          </DropdownMenuItem>
        </SignOutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const UserInfoSkeleton = () => {
  return (
    <div className="mb-4 flex w-full items-center rounded-lg p-3">
      <Skeleton className="size-8 rounded-lg bg-muted" />
      <div className="ml-2 space-y-2">
        <Skeleton className="h-3 w-[100px] bg-muted" />
        <Skeleton className="h-3 w-[150px] bg-muted" />
      </div>
      <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
    </div>
  )
}
