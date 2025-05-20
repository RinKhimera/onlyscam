import { UserListsNavigationLinks } from "@/components/shared/user-lists-navigation-links"

export default function UserListsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex h-screen w-[80%] flex-col border-l border-r border-muted max-sm:w-full">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Mes abonnements
      </h1>

      <div className="flex h-full">
        <div className="w-full border-r border-muted lg:w-2/5">
          <UserListsNavigationLinks />
        </div>

        <div className="hidden h-full w-3/5 lg:flex">{children}</div>
      </div>
    </main>
  )
}
