import { useState, useEffect } from "react";
import { featureFlagService } from "../lib/featureFlagService";
import { useAuth } from "../contexts/AuthContext";

export function useFeatureFlag(featureName) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function checkFeature() {
      setIsLoading(true);
      const enabled = await featureFlagService.isFeatureEnabled(
        featureName,
        user?.id,
      );

      if (mounted) {
        setIsEnabled(enabled);
        setIsLoading(false);
      }
    }

    checkFeature();

    return () => {
      mounted = false;
    };
  }, [featureName, user?.id]);

  return { isEnabled, isLoading };
}
