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

export const deleteAsset = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    })
    console.log(result)

    return result
  } catch (error) {
    console.error(error)
  }
}
