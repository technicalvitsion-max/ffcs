import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { query, collection, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Collections } from "@/lib/constants";
import { Role, type User } from "@/lib/types";

type FirebaseError = {
  code: string;
  message: string;
};

export class AuthService {
  static async login(email: string, password: string) {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      return res.user;
    } catch (error) {
      console.log((error as FirebaseError).code);
      throw "Invalid login credentials";
    }
  }

  static async logout() {
    try {
      await signOut(auth);
      return null;
    } catch (error) {
      throw (error as FirebaseError).message;
    }
  }

  static async getLoggedInUser(user: FirebaseUser): Promise<Partial<User>> {
    try {
      const q = query(
        collection(db, Collections.STUDENTS),
        where("id", "==", user.uid)
      );
      const res = await getDocs(q);
      const dbUser = res.docs[0].data();
      return {
        ...dbUser,
        role: dbUser.email.startsWith("vitsion") ? Role.ADMIN : Role.STUDENT,
      } as User;
    } catch {
      throw "Something went wrong. Please try again";
    }
  }

  static async triggerChangePassword(user: Partial<User>) {
    try {
      await sendPasswordResetEmail(auth, user.email!);
      return "Please check your email for the password reset email. Make sure to check your spam folders too. This session will be logged out now";
    } catch {
      throw "Could not send password reset mail. Please try again later";
    }
  }
}
