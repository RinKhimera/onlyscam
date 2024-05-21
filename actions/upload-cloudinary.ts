"use server"

const cloudinary = require("cloudinary").v2

cloudinary.config({
  secure: true,
})

console.log(cloudinary.config())

export const uploadImage = async (imagePath: string | File | ArrayBuffer) => {
  // Use the uploaded file's name as the asset's public ID and
  // allow overwriting the asset with new versions
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: "video",
  }

  try {
    // Upload the image
    const result = await cloudinary.uploader.upload(imagePath, options)
    console.log(result)
    return result.public_id
  } catch (error) {
    console.error(error)
  }
}

// const imagePath =
//   "https://cloudinary-devs.github.io/cld-docs-assets/assets/images/happy_people.jpg"

// export const submitUpload = async () => {
//   // Upload the image
//   await uploadImage(imagePath)

//   // Log the image tag to the console
// }
