import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { platforms } from "@/constants/platforms";
import { tones } from "@/constants/tones";

const lengthOptions = [
  { label: "Auto", value: "" },
  { label: "Short", value: "250" },
  { label: "Medium", value: "500" },
  { label: "Long", value: "900" },
];

const languageOptions = ["English", "Vietnamese"];

const generateSchema = z.object({
  campaign_id: z.string().min(1, "Campaign is required"),
  keyword: z
    .string()
    .trim()
    .min(1, "Keyword is required")
    .max(120, "Keyword must be 120 characters or fewer"),
  platform: z.string().min(1, "Platform is required"),
  tone: z.string().min(1, "Tone is required"),
  language: z.string().min(1, "Language is required"),
  length_limit: z.string().optional(),
});

function getDefaultValues(campaignId) {
  return {
    campaign_id: campaignId ?? "",
    keyword: "",
    platform: platforms[0] ?? "Website",
    tone: tones[0] ?? "Professional",
    language: "English",
    length_limit: "",
  };
}

export function GenerateForm({
  campaigns,
  initialCampaignId,
  onCampaignChange,
  onSubmit,
  submitError,
  isSubmitting,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(generateSchema),
    defaultValues: getDefaultValues(initialCampaignId),
  });

  useEffect(() => {
    reset((currentValues) => ({
      ...currentValues,
      campaign_id:
        initialCampaignId ??
        currentValues.campaign_id ??
        campaigns[0]?.id ??
        "",
    }));
  }, [campaigns, initialCampaignId, reset]);

  const selectedCampaignId = watch("campaign_id");

  useEffect(() => {
    if (selectedCampaignId && onCampaignChange) {
      onCampaignChange(selectedCampaignId);
    }
  }, [onCampaignChange, selectedCampaignId]);

  const submitHandler = (values) => {
    onSubmit({
      campaign_id: values.campaign_id,
      keyword: values.keyword.trim(),
      platform: values.platform,
      tone: values.tone,
      language: values.language,
      length_limit: values.length_limit ? Number(values.length_limit) : null,
    });
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Generate content
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Start with campaign context instead of writing prompts manually.
        </h2>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
          Choose a campaign, keyword and tone. The backend will create a draft content
          record, then the editor can continue refining it.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(submitHandler)}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Campaign
          </span>
          <select
            {...register("campaign_id")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            disabled={isSubmitting || campaigns.length === 0}
          >
            <option value="">Select a campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          {errors.campaign_id?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.campaign_id.message}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Keyword
          </span>
          <input
            type="text"
            placeholder="seo audit checklist"
            {...register("keyword")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            disabled={isSubmitting}
          />
          {errors.keyword?.message ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errors.keyword.message}
            </p>
          ) : null}
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Platform
            </span>
            <select
              {...register("platform")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              disabled={isSubmitting}
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Tone
            </span>
            <select
              {...register("tone")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              disabled={isSubmitting}
            >
              {tones.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Language
            </span>
            <select
              {...register("language")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              disabled={isSubmitting}
            >
              {languageOptions.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Length preset
            </span>
            <select
              {...register("length_limit")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              disabled={isSubmitting}
            >
              {lengthOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {submitError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {submitError}
          </div>
        ) : null}

        <Button
          type="submit"
          className="h-11 bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          disabled={isSubmitting || campaigns.length === 0}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              Generate content
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
