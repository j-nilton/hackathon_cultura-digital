// Firestore: utilitários de CRUD e consulta básica
import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

export async function getById<T>(collectionName: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? (snap.data() as T) : null; // Retorna dados ou null
}

export async function setById<T>(collectionName: string, id: string, data: T): Promise<void> {
  await setDoc(doc(db, collectionName, id), data, { merge: true }); // Upsert
  console.debug("setById", { collectionName, id });
}

export async function updateById(
  collectionName: string,
  id: string,
  partial: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), partial); // Atualização parcial
  console.debug("updateById", { collectionName, id });
}

export async function removeById(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id)); // Remove documento
  console.debug("removeById", { collectionName, id });
}

export async function findEq<T>(
  collectionName: string,
  field: string,
  value: unknown
): Promise<Array<{ id: string } & T>> {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const res = await getDocs(q);
  return res.docs.map((d) => ({ id: d.id, ...(d.data() as T) })); // Lista documentos
}

export function observeDoc<T>(
  collectionName: string,
  id: string,
  callback: (data: ({ id: string } & T) | null) => void
) {
  const ref = doc(db, collectionName, id);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...(snap.data() as T) }) : null);
    console.debug("observeDoc", { collectionName, id, exists: snap.exists() });
  });
}

export function observeWhereEq<T>(
  collectionName: string,
  field: string,
  value: unknown,
  callback: (data: Array<{ id: string } & T>) => void
) {
  const q = query(collection(db, collectionName), where(field, '==', value));
  return onSnapshot(q, (res) => {
    callback(res.docs.map((d) => ({ id: d.id, ...(d.data() as T) })));
    console.debug("observeWhereEq", { collectionName, field, value, count: res.docs.length });
  });
}
