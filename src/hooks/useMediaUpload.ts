import { useCallback, useState } from "react";
import { trpc } from "@/providers/trpcClient";
import { uploadToPresignedPost } from "@/lib/s3Upload";
import type { MediaCategory } from "@contracts/constants";

export function useMediaUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestUpload = trpc.media.requestUpload.useMutation();
  const confirmUpload = trpc.media.confirmUpload.useMutation();

  const upload = useCallback(
    async (
      file: File,
      category: MediaCategory,
      links?: { storyId?: number; lessonId?: number; characterId?: number }
    ) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      try {
        const { uploadUrl, fields, key, publicUrl } = await requestUpload.mutateAsync({
          category,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });

        await uploadToPresignedPost(uploadUrl, fields, file, setProgress);

        const media = await confirmUpload.mutateAsync({
          key,
          category,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          ...links,
        });

        return { url: media?.url ?? publicUrl, media };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [requestUpload, confirmUpload]
  );

  return { upload, progress, isUploading, error };
}
