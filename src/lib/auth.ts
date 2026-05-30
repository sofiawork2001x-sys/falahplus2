import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Role, Profile } from "./types";

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile | null;
  roles: Role[];
  primaryRole: Role | null;
}

let cachedUser: SessionUser | null = null;
let inFlight: Promise<SessionUser | null> | null = null;

async function loadUser(): Promise<SessionUser | null> {
  const { data: sess } = await supabase.auth.getSession();
  const u = sess.session?.user;
  if (!u) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", u.id),
  ]);
  const rs = (roles ?? []).map((r) => r.role as Role);
  return {
    id: u.id,
    email: u.email ?? "",
    profile: (profile as Profile) ?? null,
    roles: rs,
    primaryRole: rs[0] ?? null,
  };
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null | undefined>(cachedUser ?? undefined);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      if (!inFlight) inFlight = loadUser();
      const u = await inFlight;
      inFlight = null;
      cachedUser = u;
      if (alive) setUser(u);
    };
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      cachedUser = null;
      refresh();
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  return user;
}

export async function logout() {
  await supabase.auth.signOut();
  cachedUser = null;
}
