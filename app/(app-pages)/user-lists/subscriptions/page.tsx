const SubscriptionsPage = () => {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h2 className="mb-6 text-xl font-semibold">Mes abonnements</h2>

        {/* Liste des abonnements ici */}
        <div className="rounded-lg border border-muted p-4">
          <p className="text-center text-muted-foreground">
            Aucun abonnement pour le moment
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionsPage
