import { Collections } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Student, User } from "@/lib/types";
import {
  collection as firebaseCollection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export class StudentsService {
  static studentsCollection = firebaseCollection(db, Collections.STUDENTS);

  static async getAllStudents(): Promise<Partial<Student>[]> {
    try {
      const snap = await getDocs(this.studentsCollection);
      const list = snap.docs.map((doc) => {
        const data = doc.data() as Partial<Student>;
        return {
          id: data.id || doc.id,
          name: data.name || "",
          registrationNumber: data.registrationNumber || "",
          hours: data.hours ?? 0,
          email: data.email || "",
          mobile: data.mobile || "",
        };
      });
      return list.sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0));
    } catch (err) {
      console.error("Firestore getAllStudents error:", err);
      throw "Could not fetch students list";
    }
  }

  static getStudentByRegistrationNumber = async (
    registrationNumber: string
  ): Promise<Student | null> => {
    try {
      const studentsRef = this.studentsCollection;

      const q = query(
        studentsRef,
        where("registrationNumber", "==", registrationNumber)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      // Since you want specific fields, just return them manually
      const data = snapshot.docs[0].data();

      return data as Student;
    } catch {
      throw "Could not get student data";
    }
  };
  static async getTotalHours(user: Partial<User>): Promise<number> {
    try {
      const q = query(
        this.studentsCollection,
        where("registrationNumber", "==", user.registrationNumber)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs[0].data();
      return data.hours ?? 0;
    } catch {
      throw "Could not fetch total hours";
    }
  }
}
