import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInWeeks,
} from "date-fns"
import { Heart, MessageSquareText, UserRoundPlus } from "lucide-react"
import Link from "next/link"

export const NotificationItem = ({ notification }: any) => {
  const formatCustomTimeAgo = (timestamp: number): string => {
    const now = new Date()
    const date = new Date(timestamp)

    const minutes = differenceInMinutes(now, date)
    const hours = differenceInHours(now, date)
    const days = differenceInDays(now, date)
    const weeks = differenceInWeeks(now, date)
    const months = differenceInMonths(now, date)

    if (months > 1) return `+${months} mois`
    if (weeks >= 1) return `${weeks} sem.`
    if (days >= 1) return `${days} j`
    if (hours >= 1) return `${hours} h`
    if (minutes >= 1) return `${minutes} m`
    return "mnt."
  }

  const timeAgo = formatCustomTimeAgo(notification._creationTime)

  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="text-rose-500" size={32} fill="red" />
      case "comment":
        return <MessageSquareText className="text-blue-500" size={32} />
      case "newSubscription":
      case "renewSubscription":
        return <UserRoundPlus className="text-blue-500" size={32} />
      default:
        return null
    }
  }

  const getMessage = () => {
    switch (notification.type) {
      case "like":
        return "a aimé votre post."
      case "comment":
        return "a commenté votre post."
      case "newSubscription":
        return "s'est abonné à vous."
      case "renewSubscription":
        return "a renouvelé son abonnement."
      default:
        return ""
    }
  }

  return (
    <Link
      key={notification._id}
      href={`/${notification.sender?.username}/post/${notification.post?._id}`}
      className={cn("flex flex-col gap-1 border-b px-4 py-2.5", {
        "text-muted-foreground": notification.read,
      })}
    >
      <div className="flex justify-between gap-3">
        <div className="flex items-center gap-3">
          <>{getIcon()}</>
          <Link href={`/${notification.sender?.username}`}>
            <Avatar className="size-9">
              <AvatarImage
                src={notification.sender?.image}
                alt={notification.sender?.name}
              />
              <AvatarFallback className="size-11">
                <div className="animate-pulse rounded-full bg-gray-500"></div>
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="text-sm">{timeAgo}</div>
      </div>

      <div>
        <Link
          href={`/${notification.sender?.username}`}
          className="font-semibold hover:underline"
        >
          {notification.sender?.name}
        </Link>{" "}
        {getMessage()}
      </div>

      <div className="text-sm">
        {notification.type === "comment"
          ? notification.comment?.content
          : notification.post?.content}
      </div>
    </Link>
  )
}
