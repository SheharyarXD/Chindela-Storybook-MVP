import { randomUUID } from "node:crypto";
import { S3Client, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { env } from "./env";
import { MediaConstraints, type MediaCategory } from "@contracts/constants";

let instance: S3Client | undefined;

// Lazy, like getStripe() -- throws only when actually invoked with no
// credentials configured, so typecheck/build/tests stay green before AWS
// credentials are provisioned.
function getS3(): S3Client {
  if (!instance) {
    if (!env.awsRegion || !env.awsS3Bucket || !env.awsAccessKeyId || !env.awsSecretAccessKey) {
      throw new Error("AWS S3 is not configured (AWS_REGION/AWS_S3_BUCKET/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY)");
    }
    instance = new S3Client({
      region: env.awsRegion,
      credentials: { accessKeyId: env.awsAccessKeyId, secretAccessKey: env.awsSecretAccessKey },
    });
  }
  return instance;
}

const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;
const READ_URL_EXPIRY_SECONDS = 60 * 60;

export class MediaValidationError extends Error {}

function sanitizeExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "");
}

export function validateUpload(category: MediaCategory, mimeType: string, size: number, filename: string) {
  const constraints = MediaConstraints[category];
  if (!constraints) throw new MediaValidationError(`Unknown media category: ${category}`);
  if (!constraints.mimeTypes.includes(mimeType)) {
    throw new MediaValidationError(`"${mimeType}" is not an allowed MIME type for ${category} uploads.`);
  }
  if (size <= 0 || size > constraints.maxSizeBytes) {
    throw new MediaValidationError(`File exceeds the ${(constraints.maxSizeBytes / (1024 * 1024)).toFixed(0)}MB limit for ${category} uploads.`);
  }
  const ext = sanitizeExtension(filename);
  if (ext && !constraints.extensions.includes(ext)) {
    throw new MediaValidationError(`"${ext}" is not an allowed file extension for ${category} uploads.`);
  }
}

export function buildObjectKey(category: MediaCategory, originalName: string): string {
  const ext = sanitizeExtension(originalName) || "";
  return `media/${category}/${randomUUID()}${ext}`;
}

export function publicUrlFor(key: string): string {
  return `https://${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com/${key}`;
}

// True only for URLs pointing at our own S3 bucket. Used to gate any
// server-side fetch of a user-supplied URL (e.g. feeding a diary image to
// Gemini) so a child/parent session can never make the server fetch an
// arbitrary attacker-chosen URL (SSRF against internal infra/cloud metadata).
export function isOwnStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === `${env.awsS3Bucket}.s3.${env.awsRegion}.amazonaws.com`;
  } catch {
    return false;
  }
}

// A presigned POST (not a presigned PUT) so the size limit is enforced by S3
// itself via the Content-Length-Range condition -- a presigned PUT URL only
// signs the request's headers/path and does not constrain the body size, so
// relying on client-reported `size` alone would let any caller upload an
// arbitrarily large object regardless of what the app told them the limit was.
export async function createPresignedUploadPost(key: string, mimeType: string, category: MediaCategory) {
  const maxSizeBytes = MediaConstraints[category].maxSizeBytes;
  const { url, fields } = await createPresignedPost(getS3(), {
    Bucket: env.awsS3Bucket,
    Key: key,
    Conditions: [
      ["content-length-range", 1, maxSizeBytes],
      ["eq", "$Content-Type", mimeType],
    ],
    Fields: { "Content-Type": mimeType },
    Expires: UPLOAD_URL_EXPIRY_SECONDS,
  });
  return { uploadUrl: url, fields, expiresInSeconds: UPLOAD_URL_EXPIRY_SECONDS };
}

// For any media that should not be served from a public URL. Not used by the
// default image/audio/video/pdf/document flow today (those are public CMS
// content assets), but kept available for future private-file needs.
export async function createPresignedReadUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: env.awsS3Bucket, Key: key });
  return getSignedUrl(getS3(), command, { expiresIn: READ_URL_EXPIRY_SECONDS });
}

export async function headObject(key: string) {
  return getS3().send(new HeadObjectCommand({ Bucket: env.awsS3Bucket, Key: key }));
}

export async function deleteObject(key: string) {
  await getS3().send(new DeleteObjectCommand({ Bucket: env.awsS3Bucket, Key: key }));
}
