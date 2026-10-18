import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContext = { user: User };

export function useAuthUser() {
  return useOutletContext<AuthContext>().user;
}

export function ProtectedRoute() {
  const [state, setState] = useState<{ loading: boolean; user: User | null }>({
    loading: true,
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setState({ loading: false, user: data.user });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) return null;
  if (!state.user) return <Navigate to="/signin" replace />;
  return <Outlet context={{ user: state.user } satisfies AuthContext} />;
}
