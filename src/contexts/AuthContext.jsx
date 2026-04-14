import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to enrich user with Discord data
  const enrichUserWithDiscord = (session) => {
    if (!session?.user) return null;

    const discordIdentity = session.user.identities?.find(
      (identity) => identity.provider === "discord",
    );

    return {
      ...session.user,
      // Discord-specific fields
      discord_username:
        discordIdentity?.identity_data?.full_name ||
        discordIdentity?.identity_data?.custom_claims?.global_name ||
        session.user.email?.split("@")[0],
      discord_avatar: discordIdentity?.identity_data?.avatar_url || null,
      discord_discriminator:
        discordIdentity?.identity_data?.custom_claims?.discriminator || null,
    };
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(enrichUserWithDiscord(session));
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(enrichUserWithDiscord(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with Discord
  const signUpWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`,
    });
    if (error) throw error;
  };

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  };

  // Sign out
  const signOut = async () => {
    // Clear local session only, don't revoke Discord OAuth
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("Logout error:", error);
      // Fallback: force reload anyway
      window.location.reload();
      return;
    }

    window.location.reload();
  };

  const value = {
    user,
    loading,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    signInWithDiscord,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
