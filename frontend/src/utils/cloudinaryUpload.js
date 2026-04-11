/**
 * Upload an image to Cloudinary using an unsigned upload preset (free tier).
 *
 * Setup (Cloudinary dashboard):
 * 1. Create a free account at https://cloudinary.com
 * 2. Settings → Upload → Upload presets → Add preset → Signing mode: Unsigned
 * 3. Set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`
 */

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export const getCloudinaryConfig = () => ({
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
})

export const assertImageFile = (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error("No file selected.")
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Please choose a JPEG, PNG, WebP, or GIF image.")
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.")
  }
}

/**
 * @param {File} file
 * @returns {Promise<string>} secure HTTPS URL of the uploaded image
 */
export async function uploadProfileImageToCloudinary(file) {
  assertImageFile(file)

  const { cloudName, uploadPreset } = getCloudinaryConfig()
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Image upload is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your environment."
    )
  }

  const body = new FormData()
  body.append("file", file)
  body.append("upload_preset", uploadPreset)
  body.append("folder", "profile-photos")

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message ?? data?.error ?? res.statusText ?? "Upload failed"
    throw new Error(typeof msg === "string" ? msg : "Upload failed")
  }

  const url = data?.secure_url ?? data?.url
  if (!url || typeof url !== "string") {
    throw new Error("Upload succeeded but no image URL was returned.")
  }
  return url
}
