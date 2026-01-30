import { useEffect, useState } from "react";
import { observeUserDisciplines, Discipline } from "@/infra/services/firebase/disciplineService";

export function useDisciplines(userId: string | null) {
  const [items, setItems] = useState<Array<{ id: string } & Discipline>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    setLoading(true);
    const unsub = observeUserDisciplines(userId, (list) => {
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { items, loading };
}
