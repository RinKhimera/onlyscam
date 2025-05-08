import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Exécution quotidienne à 00:00 UTC pour vérifier les abonnements expirés
crons.daily(
  "check-expired-subscriptions",
  { hourUTC: 0, minuteUTC: 0 },
  internal.subscriptions.checkAndUpdateExpiredSubscriptions,
)

export default crons
