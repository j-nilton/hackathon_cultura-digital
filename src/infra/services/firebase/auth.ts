// Autenticação: cadastro, login, logout e listener do usuário atual
import { auth } from './config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

export async function signUp(email: string, password: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user; // Usuário criado
}

export async function signIn(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user; // Usuário autenticado
}

export async function signOutUser(): Promise<void> {
  await signOut(auth); // Finaliza sessão
}

export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback); // Listener de mudanças
}
