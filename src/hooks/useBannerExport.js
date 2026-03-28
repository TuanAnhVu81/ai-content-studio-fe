import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toPng } from "html-to-image";

import { queryKeys } from "@/constants/queryKeys";
import { contentService } from "@/services/contentService";

function buildCloudinaryUrl(cloudName) {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

function triggerDownload(dataUrl, filename) {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function normalizeFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function useBannerExport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ bannerRef, contentId, fileName, template, bannerConfig }) => {
      const node = bannerRef?.current;

      if (!node) {
        throw new Error("Banner preview is not ready yet.");
      }

      if (!contentId) {
        throw new Error("Missing content id for banner export.");
      }

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary env vars are missing.");
      }

      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0f172a",
      });
      const blob = await dataUrlToBlob(dataUrl);
      const formData = new FormData();

      formData.append("file", blob, `${fileName}.png`);
      formData.append("upload_preset", uploadPreset);

      const uploadResponse = await fetch(buildCloudinaryUrl(cloudName), {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Cloudinary upload failed.");
      }

      const uploadPayload = await uploadResponse.json();
      const secureUrl = uploadPayload?.secure_url;

      if (!secureUrl) {
        throw new Error("Cloudinary did not return secure_url.");
      }

      const savedContent = await contentService.updateBanner(contentId, {
        banner_url: secureUrl,
        banner_config: bannerConfig,
      });
      triggerDownload(dataUrl, `${normalizeFilename(fileName)}-${template}.png`);

      return {
        savedContent,
        secureUrl,
      };
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.contents.detail(variables.contentId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.contents.all }),
      ]);
    },
  });

  return {
    isExporting: mutation.isPending,
    error: mutation.error,
    async exportAndSave(bannerRef, contentId, options = {}) {
      const fileName = options.fileName ?? "content-banner";
      const template = options.template ?? "feed";
      const bannerConfig = options.bannerConfig ?? null;

      return mutation.mutateAsync({
        bannerRef,
        contentId,
        fileName,
        template,
        bannerConfig,
      });
    },
  };
}
