
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image buffer to Supabase Storage under a user-specific path.
 * @param imageBuffer Buffer of the image to upload
 * @param filename Original filename (for extension)
 * @param userId User's unique ID
 * @param contentType MIME type of the image
 * @returns The Supabase file path (to store in DB)
 */
export async function uploadImageToSupabase({
  imageBuffer,
  filename,
  userId,
  contentType = "application/octet-stream",
}: {
  imageBuffer: Buffer;
  filename: string;
  userId: string;
  contentType?: string;
}): Promise<string> {
  const ext = filename.split(".").pop() || "jpg";
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `user-${userId}/${Date.now()}-${uuidv4()}.${ext}`;
  const { error } = await supabase.storage
    .from("uploads")
    .upload(filePath, imageBuffer, {
      contentType,
      upsert: false,
    });
  if (error) throw error;
  return filePath;
}

export function getPublicImageUrl(filePath: string) {
  return `https://wslchdniqgjuuqkpjxhx.supabase.co/storage/v1/object/public/uploads/${filePath}`;
}
