import { buttonVariants } from "@/components/ui/button"
import { CircleX } from "lucide-react"
import Link from "next/link"

const CancelledPage = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col items-center justify-center border-l border-r border-muted max-lg:w-[100%]">
      <div className="flex flex-col items-center gap-10">
        <CircleX size={80} />

        <div className="px-3 text-center text-xl">
          Votre paiement a échoué. Veuillez réessayer plus tard.
        </div>

        <Link
          className={`${buttonVariants({ variant: "default" })}`}
          href={"/"}
        >
          Retourner à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}

export default CancelledPage
