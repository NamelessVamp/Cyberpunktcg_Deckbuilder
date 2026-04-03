import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Verificar si el user_id está en la tabla admin_users
        const { data, error } = await supabase
          .from("admin_users")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // Error significa que no está en la tabla o hay un problema
          if (error.code !== "PGRST116") {
            // PGRST116 = no rows returned (esperado si no es admin)
            console.error("Error checking admin status:", error);
          }
          setIsAdmin(false);
        } else {
          // Si data existe, es admin
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
}
