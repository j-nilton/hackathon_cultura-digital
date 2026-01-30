// Storage: upload, download URL e remoção
import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function upload(path: string, file: File | Blob): Promise<string> {
  const r = ref(storage, path);
  const snap = await uploadBytes(r, file); // Envia arquivo
  return getDownloadURL(snap.ref); // Retorna URL pública
}

export async function getUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path)); // Obtém URL por caminho
}

export async function remove(path: string): Promise<void> {
  await deleteObject(ref(storage, path)); // Remove arquivo
}
