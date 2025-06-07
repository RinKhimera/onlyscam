"use client"

import { useMutation, useQuery } from "convex/react"
import {
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  Eye,
  FileText,
  Shield,
  User,
  X,
} from "lucide-react"
import Image from "next/image"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ProfileImage } from "@/components/shared/profile-image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Application } from "@/types"
import {
  detectRiskFactors,
  getRiskBadge,
  getStatusBadge,
} from "@/utils/detectRiskFactors"

const CreatorApplicationsPage = () => {
  const currentUser = useCurrentUser()
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isPending, startTransition] = useTransition()

  // Query pour toutes les candidatures
  const allApplications = useQuery(
    api.creatorApplications.getAllApplications,
    currentUser?.accountType === "SUPERUSER" ? {} : "skip",
  )

  const reviewApplication = useMutation(
    api.creatorApplications.reviewApplication,
  )

  const handleReview = (
    applicationId: Id<"creatorApplications">,
    decision: "approved" | "rejected",
  ) => {
    if (!selectedApplication) return

    startTransition(async () => {
      try {
        await reviewApplication({
          applicationId,
          decision,
          adminNotes: adminNotes || undefined,
        })

        toast.success(
          decision === "approved"
            ? "Candidature approuvée ✅"
            : "Candidature rejetée ❌",
        )

        setSelectedApplication(null)
        setAdminNotes("")
      } catch (error) {
        console.error(error)
        toast.error("Erreur lors de la révision")
      }
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "identity_card":
        return "Carte d'identité"
      case "passport":
        return "Passeport"
      case "driving_license":
        return "Permis de conduire"
      case "selfie":
        return "Selfie"
      default:
        return type
    }
  }

  const renderApplicationCard = (
    application: Application,
    showActions = true,
  ) => {
    const riskFactors = allApplications
      ? detectRiskFactors(application, allApplications)
      : []
    const hasRisk = riskFactors.length > 0

    return (
      <Card
        key={application._id}
        className={`transition-shadow hover:shadow-md ${
          hasRisk && application.status === "pending"
            ? "border-orange-500/50 bg-orange-950/20"
            : ""
        }`}
      >
        <CardHeader className="@container">
          <div className="@md:flex @md:items-center @md:justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted">
                {application.user?.image ? (
                  <ProfileImage
                    src={application.user.image}
                    alt={application.user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-lg">
                  {application.personalInfo.fullName}
                </CardTitle>
                <CardDescription>
                  @{application.user?.username || "N/A"} •{" "}
                  <span className="hidden sm:inline">
                    {application.user?.email}
                  </span>
                  <span className="sm:hidden">
                    {application.user?.email?.split("@")[0]}...
                  </span>
                </CardDescription>
              </div>
            </div>

            {/* Bouton - Positionné différemment selon la taille du conteneur */}
            <div className="@md:ml-4 @md:flex-shrink-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full @md:mt-0 @md:w-auto"
                    onClick={() => {
                      setSelectedApplication({
                        ...application,
                        riskFactors: riskFactors,
                      })
                      setAdminNotes(application.adminNotes || "")
                    }}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">
                      {application.status === "pending" ? "Examiner" : "Voir"}
                    </span>
                    <span className="sm:hidden">
                      {application.status === "pending" ? "Examiner" : "Voir"}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Candidature de {application.personalInfo.fullName}
                    </DialogTitle>
                    <DialogDescription>
                      Soumise le {formatDate(application.submittedAt)}
                      {application.reviewedAt && (
                        <span className="ml-2">
                          • Traitée le {formatDate(application.reviewedAt)}
                        </span>
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedApplication && (
                    <div className="space-y-6">
                      {/* Alertes de risque - seulement pour les candidatures pending */}
                      {selectedApplication.riskFactors &&
                        selectedApplication.riskFactors.length > 0 &&
                        selectedApplication.status === "pending" && (
                          <Alert className="border-orange-500 bg-orange-950/50 text-orange-100">
                            <Shield className="h-4 w-4 text-orange-400" />
                            <AlertTitle className="text-orange-200">
                              Candidature à risque détectée
                            </AlertTitle>
                            <AlertDescription className="text-orange-300">
                              <ul className="mt-2 space-y-1">
                                {selectedApplication.riskFactors.map(
                                  (factor, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center text-sm"
                                    >
                                      <span
                                        className={`mr-2 rounded px-1.5 py-0.5 text-xs font-medium ${
                                          factor.level === "GRAVE"
                                            ? "bg-red-800 text-red-200"
                                            : factor.level === "MODÉRÉ"
                                              ? "bg-orange-800 text-orange-200"
                                              : "bg-yellow-800 text-yellow-200"
                                        }`}
                                      >
                                        {factor.level}
                                      </span>
                                      {factor.message}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                      {/* Informations personnelles */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5" />
                            Informations personnelles
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Nom complet
                            </p>
                            <p>{selectedApplication.personalInfo.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Date de naissance
                            </p>
                            <p>
                              {selectedApplication.personalInfo.dateOfBirth}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Téléphone
                            </p>
                            <p>
                              {selectedApplication.personalInfo.phoneNumber}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              Adresse
                            </p>
                            <p>{selectedApplication.personalInfo.address}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Documents d'identité */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Camera className="h-5 w-5" />
                            Documents d&apos;identité
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {selectedApplication.identityDocuments.map(
                              (doc, index) => (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm font-medium">
                                    {getDocumentTypeLabel(doc.type)}
                                  </p>
                                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                                    <Image
                                      src={doc.url}
                                      alt={getDocumentTypeLabel(doc.type)}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Uploadé le {formatDate(doc.uploadedAt)}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Motivations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Motivations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-wrap">
                            {selectedApplication.applicationReason}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Notes admin */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Notes administratives
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedApplication.status === "pending" ? (
                            <Textarea
                              placeholder="Ajoutez des notes sur cette candidature..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="min-h-20"
                            />
                          ) : (
                            <div className="rounded-md bg-muted p-3">
                              <p className="text-sm">
                                {selectedApplication.adminNotes ||
                                  "Aucune note administrative"}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Actions - seulement pour les candidatures en attente */}
                      {showActions &&
                        selectedApplication.status === "pending" && (
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={() =>
                                handleReview(
                                  selectedApplication._id,
                                  "approved",
                                )
                              }
                              disabled={isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approuver
                            </Button>
                            <Button
                              onClick={() =>
                                handleReview(
                                  selectedApplication._id,
                                  "rejected",
                                )
                              }
                              disabled={isPending}
                              variant="destructive"
                              className="flex-1"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Badges déplacés ici - plus d'espace */}
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(application.status)}
              {hasRisk &&
                application.status === "pending" &&
                getRiskBadge(riskFactors)}
            </div>

            {/* Informations de base */}
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(application.submittedAt)}
                </span>
                <span>{application.identityDocuments.length} document(s)</span>
              </div>
              <span className="text-xs sm:text-sm">
                Né(e) le {application.personalInfo.dateOfBirth}
              </span>
            </div>

            {/* Motivation */}
            <div>
              <p className="line-clamp-2 text-sm sm:line-clamp-3">
                {application.applicationReason}
              </p>
            </div>

            {/* Informations supplémentaires */}
            <div className="space-y-1">
              {application.reviewedAt && (
                <div className="text-xs text-muted-foreground">
                  Traitée le {formatDate(application.reviewedAt)}
                </div>
              )}
              {hasRisk && application.status === "pending" && (
                <div>
                  <p className="text-xs font-medium text-orange-400">
                    {riskFactors.length} facteur(s) de risque détecté(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = (title: string, description: string) => (
    <Card className="p-8 text-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )

  if (!currentUser || currentUser.accountType !== "SUPERUSER") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-6 text-center">
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Vous n&apos;avez pas les permissions pour accéder à cette page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!allApplications) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-lg">Chargement...</div>
      </div>
    )
  }

  const pendingApplications = allApplications.filter(
    (app) => app.status === "pending",
  )
  const processedApplications = allApplications.filter(
    (app) => app.status !== "pending",
  )

  // Compter les candidatures à risque dans les pending
  const riskyPendingCount = pendingApplications.filter(
    (app) => detectRiskFactors(app, allApplications).length > 0,
  ).length

  return (
    <main className="flex h-full min-h-screen w-full flex-col border-l border-r border-muted sm:w-[80%] lg:w-[50%]">
      <div className="sticky top-0 z-20 border-b border-muted bg-background/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Candidatures Créateur</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{allApplications.length} total</Badge>
            {riskyPendingCount > 0 && (
              <Badge variant="destructive">{riskyPendingCount} à risque</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-3">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="relative">
              En attente
              {pendingApplications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs"
                >
                  {pendingApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="processed">
              Traitées ({processedApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingApplications.length === 0 ? (
              renderEmptyState(
                "Aucune candidature en attente",
                "Toutes les candidatures ont été traitées.",
              )
            ) : (
              <>
                {riskyPendingCount > 0 && (
                  <Alert className="mb-4 border-orange-500 bg-orange-950/50 text-orange-100">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <AlertTitle className="text-orange-200">
                      Candidatures à risque détectées
                    </AlertTitle>
                    <AlertDescription className="text-orange-300">
                      {riskyPendingCount} candidature(s) présente(nt) des
                      facteurs de risque et nécessite(nt) une attention
                      particulière.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  {pendingApplications.map((application) =>
                    renderApplicationCard(application, true),
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="processed" className="mt-6">
            {processedApplications.length === 0 ? (
              renderEmptyState(
                "Aucune candidature traitée",
                "Aucune candidature n'a encore été traitée.",
              )
            ) : (
              <div className="space-y-4">
                {processedApplications.map((application) =>
                  renderApplicationCard(application, false),
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

export default CreatorApplicationsPage
