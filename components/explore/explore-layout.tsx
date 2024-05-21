"use client"

import { CldUploadWidget } from "next-cloudinary"

export const ExploreLayout = () => {
  return (
    <main className="flex h-full min-h-screen w-[50%] flex-col border-l border-r border-muted max-lg:w-[80%]">
      <h1 className="sticky top-0 z-20 border-b border-muted p-4 text-2xl font-bold backdrop-blur">
        Explorer
      </h1>

      <CldUploadWidget
        uploadPreset="post-videos"
        signatureEndpoint="/api/sign-cloudinary-params"
        options={{
          sources: ["local", "google_drive", "url", "camera"],
          publicId: "profile_buddies204",
        }}
        onSuccess={(result, { widget }) => {
          console.log(result?.info) // { public_id, secure_url, etc }
          widget.close()
        }}
      >
        {({ open }) => {
          return (
            <button className="w-fit bg-red-50/50" onClick={() => open()}>
              Upload an Image
            </button>
          )
        }}
      </CldUploadWidget>
    </main>
  )
}
