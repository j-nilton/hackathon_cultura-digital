import { useEffect, useState } from "react";
import { observeAuth } from "@/infra/services/firebase";
import { observeUserProfile, UserProfile } from "@/infra/services/firebase/profiles";
import type { User } from "firebase/auth";

export function useUserProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<(UserProfile & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubAuth = observeAuth((user) => {
      setAuthUser(user);
      setUserId(user ? user.uid : null);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = observeUserProfile(userId, (p) => {
      setProfile(p);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { userId, profile, authUser, loading, error };
}
