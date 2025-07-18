import * as React from "react"

type ReportEmailTemplateProps = {
  reportType: "user" | "post" | "comment"
  reason: string
  description?: string
  reporterUsername: string
  reportedUsername?: string
  reportedContent?: string
  // reportId: string
}

export function ReportEmailTemplate({
  reportType,
  reason,
  description,
  reporterUsername,
  reportedUsername,
  reportedContent,
  // reportId,
}: ReportEmailTemplateProps) {
  const getReasonLabel = (reason: string) => {
    const reasons = {
      spam: "Spam",
      harassment: "Harcèlement",
      inappropriate_content: "Contenu inapproprié",
      fake_account: "Faux compte",
      copyright: "Violation de droits d'auteur",
      violence: "Violence",
      hate_speech: "Discours de haine",
      other: "Autre",
    }
    return reasons[reason as keyof typeof reasons] || reason
  }

  const getTypeLabel = (type: string) => {
    const types = {
      user: "Utilisateur",
      post: "Publication",
      comment: "Commentaire",
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ color: "#dc2626", marginBottom: "20px" }}>
          🚨 Nouveau signalement - FanTribe
        </h1>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ color: "#374151", marginBottom: "16px" }}>
            Détails du signalement
          </h2>

          <div style={{ marginBottom: "12px" }}>
            <strong>Type:</strong> {getTypeLabel(reportType)}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>Motif:</strong> {getReasonLabel(reason)}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <strong>Signalé par:</strong> @{reporterUsername}
          </div>

          {reportedUsername && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Utilisateur signalé:</strong> @{reportedUsername}
            </div>
          )}

          {description && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Description:</strong>
              <p
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "12px",
                  borderRadius: "4px",
                  margin: "8px 0",
                }}
              >
                {description}
              </p>
            </div>
          )}

          {reportedContent && (
            <div style={{ marginBottom: "12px" }}>
              <strong>Contenu signalé:</strong>
              <p
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "12px",
                  borderRadius: "4px",
                  margin: "8px 0",
                }}
              >
                {reportedContent.substring(0, 200)}
                {reportedContent.length > 200 ? "..." : ""}
              </p>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <a
            href={"https://fantribe.io/superuser/reports"}
            style={{
              backgroundColor: "#7c3aed",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "6px",
              display: "inline-block",
            }}
          >
            Voir dans le panel d&apos;administration
          </a>
        </div>

        <div
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          <p>
            Ce signalement nécessite une action de modération.
            <br />
            Veuillez traiter ce signalement dans les plus brefs délais.
          </p>
        </div>
      </div>
    </div>
  )
}
