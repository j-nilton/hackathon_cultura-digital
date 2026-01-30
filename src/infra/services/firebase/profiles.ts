import { db } from "./config";
import { getById, setById } from "./firestore";
import { doc, onSnapshot } from "firebase/firestore";

export type UserProfile = {
  name: string;
  email: string;
  school?: string;
  city?: string;
  createdAt?: number;
  updatedAt?: number;
};

export async function setUserProfile(uid: string, data: Partial<UserProfile>) {
  const payload = {
    ...data,
    updatedAt: Date.now(),
    createdAt: data.createdAt ?? Date.now(),
  };
  await setById("users", uid, payload);
}

export async function getUserProfile(uid: string) {
  return getById<UserProfile>("users", uid);
}

export function observeUserProfile(
  uid: string,
  callback: (profile: (UserProfile & { id: string }) | null) => void
) {
  const ref = doc(db, "users", uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      callback(null);
    } else {
      const data = snap.data() as UserProfile;
      callback({ id: snap.id, ...data });
    }
  });
}
