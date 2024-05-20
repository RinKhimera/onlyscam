"use client"

import { submitUpload, uploadImage } from "@/actions/upload-cloudinary"

export const ExploreLayout = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Explorer
      </h1>

      <input
        type="file"
        // accept="image/*"
        // ref={imgRef}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onloadend = async () => {
              const base64data = reader.result
              await uploadImage(base64data as string | ArrayBuffer)
            }
            reader.readAsDataURL(file)
          }
        }}
        // hidden
      />
    </main>
  )
}
