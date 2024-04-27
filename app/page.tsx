import LeftSidebar from "@/components/shared/left-sidebar"
import { ModeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import { EllipsisVertical, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        {/* Left sidebar for navigation & header */}
        <LeftSidebar />
        <main className="ml-[290px]"></main>
        {/* <section>Right section</section> */}
      </div>
    </div>
  )
}
