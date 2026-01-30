import { useEffect, useState } from "react";
import { observeUnitsByDiscipline, Unit } from "@/infra/services/firebase/unitService";

export function useUnitsByDiscipline(disciplineId: string | undefined) {
  const [items, setItems] = useState<Array<{ id: string } & Unit>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!disciplineId) {
      setItems([]);
      return;
    }
    setLoading(true);
    const unsub = observeUnitsByDiscipline(disciplineId, (list) => {
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, [disciplineId]);

  return { items, loading, error };
}
