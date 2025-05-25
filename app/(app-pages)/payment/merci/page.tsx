import { CircleCheckBig } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

const MerciPage = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col items-center justify-center border-l border-r border-muted max-lg:w-[100%]">
      <div className="flex flex-col items-center gap-10">
        <CircleCheckBig size={80} />

        <div className="px-3 text-center text-xl">
          Votre paiement a été effectué avec succès !
          <br />
          Merci et profitez de votre service.
        </div>

        <Link
          className={`${buttonVariants({ variant: "default" })}`}
          href={`/`}
        >
          Retourner au profil
        </Link>
      </div>
    </main>
  )
}

export default MerciPage
