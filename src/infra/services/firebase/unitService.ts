import { observeWhereEq, setById, removeById, updateById, findEq, getById } from "./firestore";

export type Unit = {
  title: string;
  discipline: string;
  type: "manual" | "ai";
  status: "em_andamento" | "concluida" | "planejada";
  userId: string;
  createdAt?: number;
  updatedAt?: number;
  description?: string;
  bnccSkills?: string[];
  objectives?: string[];
  plan?: Array<{ title: string; minutes: number; description: string }>;
  criteria?: Array<{ name: string; weight: number }>;
  lessonsCount?: number;
  durationMinutes?: number;
};

export function observeUserUnits(
  userId: string,
  cb: (items: Array<{ id: string } & Unit>) => void
) {
  return observeWhereEq<Unit>("units", "userId", userId, cb);
}

export function observeUnitsByDiscipline(
  disciplineId: string,
  cb: (items: Array<{ id: string } & Unit>) => void
) {
  return observeWhereEq<Unit>("units", "discipline", disciplineId, cb);
}

export async function createUnit(id: string, data: Unit) {
  await setById("units", id, { ...data, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function updateUnit(id: string, partial: Partial<Unit>) {
  await updateById("units", id, { ...partial, updatedAt: Date.now() });
}

export async function removeUnit(id: string) {
  await removeById("units", id);
}

export async function getUnitsByDiscipline(disciplineId: string) {
  return findEq<Unit>("units", "discipline", disciplineId);
}

export const addUnit = createUnit;
export const deleteUnit = removeUnit;

export async function getUnitById(id: string) {
  return getById<Unit>("units", id);
}
