import { supabase } from "./supabase";

class FeatureFlagService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async isFeatureEnabled(featureName, userId = null) {
    const cached = this.cache.get(featureName);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return this.checkAccess(cached.flag, userId);
    }

    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .eq("feature_name", featureName)
      .single();

    if (error || !data) {
      console.error(`Feature flag ${featureName} not found:`, error);
      return false;
    }

    this.cache.set(featureName, {
      flag: data,
      timestamp: Date.now(),
    });

    return this.checkAccess(data, userId);
  }

  async checkAccess(flag, userId) {
    if (!flag.is_enabled) {
      return false;
    }

    if (!flag.is_admin_only) {
      return true;
    }

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return false;
    }

    const { data: adminRecord } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", userId)
      .single();

    return !!adminRecord;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const featureFlagService = new FeatureFlagService();
