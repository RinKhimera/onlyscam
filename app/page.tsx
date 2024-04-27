import { ModeToggle } from "@/components/shared/theme-toggle"
import { navigationLinks } from "@/constants"
import { Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-full w-full max-w-screen-xl">
        {/* Left sidebar for navigation & header */}
        <section className="fixed my-4 flex h-screen w-72 flex-col space-y-4">
          <Link href={"/"} className="p-2 text-xl">
            <Star />
          </Link>

          {navigationLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="flex w-fit items-center justify-start space-x-4 rounded-3xl p-2 text-xl transition duration-200 hover:bg-foreground/10"
            >
              <div>{link.icon}</div>
              <div>{link.title}</div>
            </Link>
          ))}
        </section>
        {/* <main>Home Timeline</main>
        <section>Right section</section> */}
      </div>
    </div>
  )
}
