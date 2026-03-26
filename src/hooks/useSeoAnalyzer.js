import debounce from "lodash/debounce";
import { useEffect, useMemo, useState } from "react";

import { seoCalculator } from "@/utils/seoCalculator";

export function useSeoAnalyzer({
  htmlContent,
  keyword,
  metaTitle,
  metaDescription,
}) {
  const [analysis, setAnalysis] = useState(() =>
    htmlContent?.trim()
      ? seoCalculator({ htmlContent, keyword, metaTitle, metaDescription })
      : null
  );

  const debouncedAnalyze = useMemo(
    () =>
      debounce((nextInput) => {
        if (!nextInput.htmlContent?.trim()) {
          setAnalysis(null);
          return;
        }

        setAnalysis(seoCalculator(nextInput));
      }, 500),
    []
  );

  useEffect(() => {
    debouncedAnalyze({ htmlContent, keyword, metaTitle, metaDescription });

    return () => {
      debouncedAnalyze.cancel();
    };
  }, [debouncedAnalyze, htmlContent, keyword, metaTitle, metaDescription]);

  return analysis;
}
