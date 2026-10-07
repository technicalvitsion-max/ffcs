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
  static async login(identifier: string, password: string) {
    try {
      let emailToAuth = identifier.trim();

      // If user entered registration number instead of email
      if (!emailToAuth.includes("@")) {
        const q = query(
          collection(db, Collections.STUDENTS),
          where("registrationNumber", "==", emailToAuth.toUpperCase())
        );
        const res = await getDocs(q);
        if (!res.empty) {
          const studentData = res.docs[0].data();
          if (studentData.email) {
            emailToAuth = studentData.email;
          }
        } else {
          emailToAuth = `${emailToAuth.toLowerCase()}@vitstudent.ac.in`;
        }
      }

      const res = await signInWithEmailAndPassword(auth, emailToAuth, password);
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

      if (!res.empty) {
        const dbUser = res.docs[0].data();
        const userEmail = (dbUser.email || user.email || "").toLowerCase();
        const isAdmin =
          dbUser.role === Role.ADMIN ||
          userEmail.includes("vitsion") ||
          userEmail.startsWith("admin");

        return {
          ...dbUser,
          role: isAdmin ? Role.ADMIN : Role.STUDENT,
        } as User;
      }

      // Fallback for admin if account exists in Auth but not yet in students collection
      const email = (user.email || "").toLowerCase();
      if (email.includes("vitsion") || email.startsWith("admin")) {
        return {
          id: user.uid,
          name: user.displayName || "Admin",
          email: user.email || "admin@vitsion.com",
          mobile: "",
          hours: 0,
          registrationNumber: "ADMIN",
          role: Role.ADMIN,
        } as User;
      }

      throw "Student not found in roster";
    } catch (error) {
      console.error(error);
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

  static async sendForgotPasswordEmail(identifier: string) {
    try {
      let emailToReset = identifier.trim();

      if (!emailToReset) {
        throw "Please enter your Registration Number or Email address";
      }

      // If user entered registration number instead of email
      if (!emailToReset.includes("@")) {
        const q = query(
          collection(db, Collections.STUDENTS),
          where("registrationNumber", "==", emailToReset.toUpperCase())
        );
        const res = await getDocs(q);
        if (!res.empty) {
          const studentData = res.docs[0].data();
          if (studentData.email) {
            emailToReset = studentData.email;
          }
        } else {
          emailToReset = `${emailToReset.toLowerCase()}@vitstudent.ac.in`;
        }
      }

      await sendPasswordResetEmail(auth, emailToReset);
      return `Password reset email dispatched to ${emailToReset}. Please check your inbox and spam folders.`;
    } catch (error) {
      console.error("Forgot password error:", error);
      const err = error as FirebaseError;
      if (err.code === "auth/user-not-found") {
        throw "No registered account found with this credential.";
      }
      if (err.code === "auth/invalid-email") {
        throw "Please enter a valid email address.";
      }
      throw typeof error === "string" ? error : "Could not send password reset email. Please try again.";
    }
  }
}
