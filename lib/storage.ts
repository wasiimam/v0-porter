import { getSupabaseBrowserClient, createServerClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Constants
const BUCKET_NAME = "doorstep-images"
const PUBLIC_BUCKET_NAME = "doorstep-public"

// Initialize storage buckets (call this on app initialization)
export async function initializeStorage() {
  const supabase = createServerClient()

  // Create buckets if they don't exist
  const { data: buckets } = await supabase.storage.listBuckets()

  if (!buckets?.find((bucket) => bucket.name === BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
    })
  }

  if (!buckets?.find((bucket) => bucket.name === PUBLIC_BUCKET_NAME)) {
    await supabase.storage.createBucket(PUBLIC_BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    })
  }
}

// Upload image to storage
export async function uploadImage(file: File, isPublic = false) {
  const supabase = getSupabaseBrowserClient()
  const bucket = isPublic ? PUBLIC_BUCKET_NAME : BUCKET_NAME

  // Generate a unique file path
  const fileExt = file.name.split(".").pop()
  const fileName = `${uuidv4()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  // Upload the file
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw error
  }

  // Store metadata in the database
  const { error: dbError } = await supabase.from("images").insert({
    bucket_name: bucket,
    file_path: filePath,
    file_name: file.name,
    content_type: file.type,
    size: file.size,
  })

  if (dbError) {
    console.error("Error storing image metadata:", dbError)
  }

  // Get public URL if it's in the public bucket
  if (isPublic) {
    const {
      data: { publicUrl },
    } = supabase.storage.from(PUBLIC_BUCKET_NAME).getPublicUrl(filePath)

    return { path: filePath, url: publicUrl }
  }

  return { path: filePath }
}

// Get image URL (signed URL for private images, public URL for public images)
export async function getImageUrl(path: string, bucket: string = BUCKET_NAME) {
  const supabase = getSupabaseBrowserClient()

  if (bucket === PUBLIC_BUCKET_NAME) {
    const {
      data: { publicUrl },
    } = supabase.storage.from(PUBLIC_BUCKET_NAME).getPublicUrl(path)

    return publicUrl
  }

  // For private images, create a signed URL that expires
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60) // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error)
    return null
  }

  return data.signedUrl
}

// Delete image from storage
export async function deleteImage(path: string, bucket: string = BUCKET_NAME) {
  const supabase = getSupabaseBrowserClient()

  // Delete the file
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw error
  }

  // Delete metadata from database
  await supabase.from("images").delete().match({ bucket_name: bucket, file_path: path })
}
