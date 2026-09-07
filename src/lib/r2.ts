import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

function getClient() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string
    }
  });
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Uploads a File/Blob to the Cloudflare R2 bucket under products/ and
 * returns its public URL (served from R2_PUBLIC_URL, e.g. the free r2.dev
 * subdomain or a custom domain connected in the Cloudflare dashboard).
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WEBP or AVIF.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image too large (max 8MB).");
  }

  const ext = file.type.split("/")[1];
  const key = `products/${Date.now()}-${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type
    })
  );

  const base = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function deleteProductImage(publicUrl: string) {
  const base = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  if (!publicUrl.startsWith(base)) return; // not one of ours, skip
  const key = publicUrl.slice(base.length + 1);

  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key
    })
  );
}
