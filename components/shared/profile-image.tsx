"use client"

import { CldImage } from "next-cloudinary"
import Image from "next/image"
import React from "react"

type ProfileImageProps = {
  src: string | undefined
  width?: number
  height?: number
  alt: string
  className?: string
}

/**
 * Composant réutilisable pour afficher les images de profil
 * Gère automatiquement les différentes sources d'images (Clerk ou Cloudinary)
 */
export const ProfileImage = ({
  src,
  width = 100,
  height = 100,
  alt,
  className = "aspect-square h-full w-full object-cover",
}: ProfileImageProps) => {
  if (!src) {
    return null
  }

  // Si l'image provient de Clerk, utilisez le composant Image de Next.js
  if (src.includes("clerk.")) {
    return (
      <Image
        src={src}
        width={width}
        height={height}
        className={className}
        alt={alt}
      />
    )
  }

  // Sinon, utilisez CldImage pour les images Cloudinary
  return (
    <CldImage
      src={src}
      width={width}
      height={height}
      crop="auto"
      className={className}
      alt={alt}
    />
  )
}
