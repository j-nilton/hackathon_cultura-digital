import { observeWhereEq, setById, removeById, updateById, getById } from "./firestore";

export type Discipline = {
  name: string;
  level: string;
  levelVariant: "fundamental1" | "fundamental2" | "medio";
  unitsCount: number;
  lastAccess?: string;
  description?: string;
  weekly?: number;
  userId: string;
  createdAt?: number;
  updatedAt?: number;
};

export function observeUserDisciplines(
  userId: string,
  cb: (items: Array<{ id: string } & Discipline>) => void
) {
  return observeWhereEq<Discipline>("disciplines", "userId", userId, cb);
}

export async function createDiscipline(id: string, data: Discipline) {
  await setById("disciplines", id, { ...data, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateDiscipline(id: string, partial: Partial<Discipline>) {
  await updateById("disciplines", id, { ...partial, updatedAt: Date.now() });
}

export async function removeDiscipline(id: string) {
  await removeById("disciplines", id);
}

export async function getDisciplineById(id: string) {
  return getById<Discipline>("disciplines", id);
}
