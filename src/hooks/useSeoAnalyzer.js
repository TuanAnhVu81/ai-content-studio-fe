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
  const stableMetaKey = `${metaTitle}::${metaDescription}::${keyword}`;

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
  }, [debouncedAnalyze, htmlContent]);

  useEffect(() => {
    if (!htmlContent?.trim()) {
      setAnalysis(null);
      return;
    }

    setAnalysis(seoCalculator({ htmlContent, keyword, metaTitle, metaDescription }));
  }, [stableMetaKey]);

  return analysis;
}
