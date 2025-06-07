"use client"

import {
  CloudinaryUploadWidget,
  CloudinaryUploadWidgetResults,
} from "@cloudinary-util/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { Camera, FileText, Upload, X } from "lucide-react"
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary"
import { useEffect, useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { deleteAsset } from "@/actions/upload-cloudinary"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { generateRandomString } from "@/utils/generateRandomString"

const applicationSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  dateOfBirth: z.string().min(1, "La date de naissance est requise"),
  address: z.string().min(10, "L'adresse complète est requise"),
  phoneNumber: z.string().min(10, "Le numéro de téléphone est requis"),
  applicationReason: z.enum(
    [
      "monetisation",
      "passion_partage",
      "expertise_professionnelle",
      "influence_communaute",
      "creativite_artistique",
      "business_entrepreneur",
      "education_formation",
      "lifestyle_personnel",
      "autre",
    ],
    {
      required_error: "Veuillez sélectionner une motivation",
    },
  ),
  customReason: z.string().optional(),
})

type ApplicationForm = z.infer<typeof applicationSchema>

interface UploadedDocument {
  url: string
  publicId: string
  uploadedAt: number
}

const motivationOptions = [
  {
    value: "monetisation",
    label: "Monétiser mon contenu",
    description: "Générer des revenus grâce à mes créations et mon audience",
  },
  {
    value: "passion_partage",
    label: "Partager ma passion",
    description:
      "Faire découvrir mes centres d'intérêts et hobbies à une communauté",
  },
  {
    value: "expertise_professionnelle",
    label: "Partager mon expertise professionnelle",
    description: "Transmettre mes connaissances métier et expériences",
  },
  {
    value: "influence_communaute",
    label: "Développer mon influence",
    description: "Construire une communauté engagée autour de mes idées",
  },
  {
    value: "creativite_artistique",
    label: "Exprimer ma créativité artistique",
    description:
      "Montrer mes créations artistiques, photos, vidéos, musique...",
  },
  {
    value: "business_entrepreneur",
    label: "Développer mon business",
    description:
      "Promouvoir mes produits/services et développer mon entreprise",
  },
  {
    value: "education_formation",
    label: "Éduquer et former",
    description: "Créer du contenu éducatif, tutoriels, formations",
  },
  {
    value: "lifestyle_personnel",
    label: "Partager mon style de vie",
    description: "Documenter et partager mon quotidien, mes voyages, ma vie",
  },
  {
    value: "autre",
    label: "Autre raison",
    description: "Une motivation spécifique non listée ci-dessus",
  },
]

const ApplyCreatorPage = () => {
  const currentUser = useCurrentUser()
  const [isPending, startTransition] = useTransition()
  const [uploadedDocuments, setUploadedDocuments] = useState<{
    identityCard?: UploadedDocument
    selfie?: UploadedDocument
  }>({})
  const [randomString] = useState(() => generateRandomString(6))

  const submitApplication = useMutation(
    api.creatorApplications.submitApplication,
  )
  const createDraftDocument = useMutation(
    api.validationDocuments.createDraftDocument,
  )
  const deleteDraftDocument = useMutation(
    api.validationDocuments.deleteDraftDocument,
  )

  const isApplicationSubmittedRef = useRef(false)
  const uploadedDocumentsRef = useRef<{
    identityCard?: UploadedDocument
    selfie?: UploadedDocument
  }>({})

  useEffect(() => {
    uploadedDocumentsRef.current = uploadedDocuments
  }, [uploadedDocuments])

  useEffect(() => {
    return () => {
      if (!isApplicationSubmittedRef.current) {
        const currentDocs = uploadedDocumentsRef.current
        Object.values(currentDocs).forEach((doc) => {
          if (doc?.publicId) {
            deleteAsset(doc.publicId).catch((error) => {
              console.error("Erreur lors de la suppression du document:", error)
            })
            deleteDraftDocument({ publicId: doc.publicId }).catch((error) => {
              console.error(
                "Erreur lors de la suppression du brouillon:",
                error,
              )
            })
          }
        })
      }
    }
  }, [deleteDraftDocument])

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: currentUser?.name || "",
      dateOfBirth: "",
      address: "",
      phoneNumber: "",
    },
  })

  const selectedMotivation = form.watch("applicationReason")

  const handleUploadSuccess = (
    type: "identityCard" | "selfie",
    result: CloudinaryUploadWidgetResults,
    widget: CloudinaryUploadWidget,
  ) => {
    const data = result.info as CloudinaryUploadWidgetInfo

    const uploadedDoc: UploadedDocument = {
      url: data.secure_url,
      publicId: data.public_id,
      uploadedAt: Date.now(),
    }

    setUploadedDocuments((prev) => ({ ...prev, [type]: uploadedDoc }))

    if (currentUser) {
      createDraftDocument({
        userId: currentUser._id,
        publicId: data.public_id,
        documentType: type === "identityCard" ? "identity_card" : "selfie",
      }).catch((error) => {
        console.error("Erreur lors de l'enregistrement du brouillon:", error)
      })
    }

    widget.close()
    toast.success(
      `${type === "identityCard" ? "Pièce d'identité" : "Selfie"} ajouté`,
    )
  }

  const handleRemoveDocument = async (type: "identityCard" | "selfie") => {
    const document = uploadedDocuments[type]
    if (!document) return

    try {
      await deleteAsset(document.publicId)
      await deleteDraftDocument({ publicId: document.publicId })
      setUploadedDocuments((prev) => ({
        ...prev,
        [type]: undefined,
      }))
      toast.success("Document supprimé")
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

  const onSubmit = async (data: ApplicationForm) => {
    if (!currentUser) return

    if (!uploadedDocuments.identityCard || !uploadedDocuments.selfie) {
      toast.error("Veuillez uploader tous les documents requis")
      return
    }

    // Validation pour "autre" motivation
    if (data.applicationReason === "autre" && !data.customReason?.trim()) {
      toast.error("Veuillez préciser votre motivation")
      return
    }

    startTransition(async () => {
      try {
        const documents = [
          {
            type: "identity_card" as const,
            url: uploadedDocuments.identityCard!.url,
            publicId: uploadedDocuments.identityCard!.publicId,
            uploadedAt: uploadedDocuments.identityCard!.uploadedAt,
          },
          {
            type: "selfie" as const,
            url: uploadedDocuments.selfie!.url,
            publicId: uploadedDocuments.selfie!.publicId,
            uploadedAt: uploadedDocuments.selfie!.uploadedAt,
          },
        ]

        // Construire la raison finale
        const finalReason =
          data.applicationReason === "autre"
            ? data.customReason
            : motivationOptions.find(
                (opt) => opt.value === data.applicationReason,
              )?.label

        await submitApplication({
          userId: currentUser._id,
          personalInfo: {
            fullName: data.fullName,
            dateOfBirth: data.dateOfBirth,
            address: data.address,
            phoneNumber: data.phoneNumber,
          },
          applicationReason: finalReason || "",
          identityDocuments: documents,
        })

        isApplicationSubmittedRef.current = true

        toast.success("Candidature soumise avec succès ! 🎉", {
          description: "Nous examinerons votre demande sous 24-48h.",
        })

        setTimeout(() => {
          window.location.href = "/be-creator"
        }, 2000)
      } catch (error) {
        console.error(error)
        toast.error("Erreur lors de la soumission", {
          description: "Veuillez réessayer plus tard.",
        })
      }
    })
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Chargement...
      </div>
    )
  }

  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%] max-sm:w-full max-[500px]:pb-16">
      <div className="sticky top-0 z-20 border-b border-muted bg-background/95 p-4 backdrop-blur">
        <h1 className="text-2xl font-bold">Candidature Créateur</h1>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom complet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse complète</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Votre adresse complète"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre numéro de téléphone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Vérification d&apos;identité
                  </CardTitle>
                  <CardDescription>
                    Uploadez une photo de votre pièce d&apos;identité et un
                    selfie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pièce d'identité */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Pièce d&apos;identité (carte d&apos;identité, passeport,
                      permis)
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
                      {uploadedDocuments.identityCard ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600">
                            ✓ Document d&apos;identité uploadé
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument("identityCard")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <CldUploadWidget
                          uploadPreset="id-validation"
                          signatureEndpoint="/api/sign-cloudinary-params"
                          options={{
                            sources: ["local", "camera"],
                            publicId: `id-${currentUser._id}-${randomString}`,
                            multiple: false,
                            maxFileSize: 10 * 1024 * 1024,
                            clientAllowedFormats: ["image"],
                          }}
                          onSuccess={(result, { widget }) =>
                            handleUploadSuccess("identityCard", result, widget)
                          }
                        >
                          {({ open }) => (
                            <div>
                              <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                              <button
                                type="button"
                                onClick={() => open()}
                                className="cursor-pointer text-primary"
                              >
                                Cliquez pour uploader
                              </button>
                            </div>
                          )}
                        </CldUploadWidget>
                      )}
                    </div>
                  </div>

                  {/* Selfie */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Selfie avec votre pièce d&apos;identité
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
                      {uploadedDocuments.selfie ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600">
                            ✓ Selfie uploadé
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument("selfie")}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <CldUploadWidget
                          uploadPreset="selfie-validation"
                          signatureEndpoint="/api/sign-cloudinary-params"
                          options={{
                            sources: ["local", "camera"],
                            publicId: `selfie-${currentUser._id}-${randomString}`,
                            multiple: false,
                            maxFileSize: 10 * 1024 * 1024,
                            clientAllowedFormats: ["image"],
                          }}
                          onSuccess={(result, { widget }) =>
                            handleUploadSuccess("selfie", result, widget)
                          }
                        >
                          {({ open }) => (
                            <div>
                              <Camera className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                              <button
                                type="button"
                                onClick={() => open()}
                                className="cursor-pointer text-primary"
                              >
                                Cliquez pour uploader
                              </button>
                            </div>
                          )}
                        </CldUploadWidget>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivations */}
              <Card>
                <CardHeader>
                  <CardTitle>Motivation</CardTitle>
                  <CardDescription>
                    Quelle est votre principale motivation pour devenir créateur
                    ?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="applicationReason"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid gap-4"
                          >
                            {motivationOptions.map((option) => (
                              <div
                                key={option.value}
                                className="flex items-start space-x-2"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="mt-1"
                                />
                                <div className="grid flex-1 gap-1.5 leading-none">
                                  <Label
                                    htmlFor={option.value}
                                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.label}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Champ personnalisé si "Autre" est sélectionné */}
                  {selectedMotivation === "autre" && (
                    <FormField
                      control={form.control}
                      name="customReason"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Précisez votre motivation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Décrivez votre motivation spécifique..."
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Soumission en cours...
                  </>
                ) : (
                  "Soumettre ma candidature"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  )
}

export default ApplyCreatorPage
