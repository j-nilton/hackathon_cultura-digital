import { useEffect, useState } from "react";
import { observeUserUnits, Unit } from "@/infra/services/firebase/unitService";

export function useUnits(userId: string | null) {
  const [items, setItems] = useState<Array<{ id: string } & Unit>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    const unsub = observeUserUnits(userId, (list) => {
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { items, loading };
}
