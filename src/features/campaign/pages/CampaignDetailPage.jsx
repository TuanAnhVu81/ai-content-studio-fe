import { useParams } from "react-router-dom";

import { RoutePlaceholder } from "@/components/common/RoutePlaceholder";

export function CampaignDetailPage() {
  const { id } = useParams();

  return (
    <RoutePlaceholder
      eyebrow="Campaign Detail"
      title={`Campaign ${id}`}
      description="The detail route is registered now so editor and content flows can target a stable URL structure in later phases."
    />
  );
}
