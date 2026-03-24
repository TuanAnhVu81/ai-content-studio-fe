import { useParams } from "react-router-dom";

import { RoutePlaceholder } from "@/components/common/RoutePlaceholder";

export function EditorPage() {
  const { id } = useParams();

  return (
    <RoutePlaceholder
      eyebrow="Editor"
      title={`Editor workspace for content ${id}`}
      description="Phase 3 will mount the generation form, editor, SEO sidebar and save pipeline here. The route, protected access and layout are already in place."
    />
  );
}
