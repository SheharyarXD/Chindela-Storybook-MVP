import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, adminQuery } from "./middleware";
import {
  createMedia,
  findMediaById,
  findMediaPaginated,
  updateMedia,
  deleteMedia,
} from "./queries/media";
import {
  validateUpload,
  buildObjectKey,
  publicUrlFor,
  createPresignedUploadPost,
  headObject,
  deleteObject,
  MediaValidationError,
} from "./lib/storage";
import { MediaCategories, MediaListDefaults } from "@contracts/constants";

const mediaCategory = z.enum(MediaCategories);

const requestUploadInput = z.object({
  category: mediaCategory,
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
});

function wrapValidation<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    if (err instanceof MediaValidationError) {
      throw new TRPCError({ code: "BAD_REQUEST", message: err.message });
    }
    throw err;
  }
}

export const mediaRouter = createRouter({
  requestUpload: adminQuery.input(requestUploadInput).mutation(async ({ input }) => {
    wrapValidation(() => validateUpload(input.category, input.mimeType, input.size, input.filename));
    const key = buildObjectKey(input.category, input.filename);
    // The size limit is enforced by S3 itself (via the POST policy's
    // content-length-range condition), not just by this request-time check --
    // see createPresignedUploadPost.
    const { uploadUrl, fields, expiresInSeconds } = await createPresignedUploadPost(key, input.mimeType, input.category);
    return { key, uploadUrl, fields, expiresInSeconds, publicUrl: publicUrlFor(key) };
  }),

  confirmUpload: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        category: mediaCategory,
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1),
        size: z.number().int().positive(),
        storyId: z.number().optional(),
        lessonId: z.number().optional(),
        characterId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      wrapValidation(() => validateUpload(input.category, input.mimeType, input.size, input.originalName));

      // Confirms the object actually landed in S3 before trusting client-reported
      // metadata -- never create a media row for an upload that never happened.
      // The real size comes from S3's own HEAD response, not the client, since
      // the client-reported `size` is only used for the pre-upload UX check.
      let actualSize: number;
      try {
        const head = await headObject(input.key);
        actualSize = head.ContentLength ?? input.size;
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Upload not found in storage. Please retry the upload." });
      }

      return createMedia({
        filename: input.key.split("/").pop() ?? input.key,
        originalName: input.originalName,
        mimeType: input.mimeType,
        storageKey: input.key,
        url: publicUrlFor(input.key),
        size: actualSize,
        type: input.category,
        storyId: input.storyId,
        lessonId: input.lessonId,
        characterId: input.characterId,
        uploadedBy: ctx.user.id,
      });
    }),

  list: adminQuery
    .input(
      z.object({
        type: mediaCategory.optional(),
        search: z.string().optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(MediaListDefaults.maxPageSize).default(MediaListDefaults.pageSize),
      })
    )
    .query(async ({ input }) => {
      return findMediaPaginated(input);
    }),

  replace: adminQuery
    .input(
      z.object({
        id: z.number(),
        key: z.string().min(1),
        category: mediaCategory,
        originalName: z.string().min(1).max(255),
        mimeType: z.string().min(1),
        size: z.number().int().positive(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await findMediaById(input.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Media not found." });

      wrapValidation(() => validateUpload(input.category, input.mimeType, input.size, input.originalName));
      let actualSize: number;
      try {
        const head = await headObject(input.key);
        actualSize = head.ContentLength ?? input.size;
      } catch {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Upload not found in storage. Please retry the upload." });
      }

      const oldKey = existing.storageKey;
      const updated = await updateMedia(input.id, {
        filename: input.key.split("/").pop() ?? input.key,
        originalName: input.originalName,
        mimeType: input.mimeType,
        storageKey: input.key,
        url: publicUrlFor(input.key),
        size: actualSize,
        type: input.category,
      });
      await deleteObject(oldKey).catch(() => undefined); // best-effort cleanup of the replaced object
      return updated;
    }),

  delete: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const existing = await findMediaById(input.id);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Media not found." });
    await deleteObject(existing.storageKey).catch(() => undefined);
    await deleteMedia(input.id);
    return { success: true };
  }),
});
