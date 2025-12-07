import { Collections } from "@/lib/constants";
import { db } from "@/lib/firebase";
import type { Student, User } from "@/lib/types";
import {
  collection as firebaseCollection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export class StudentsService {
  static studentsCollection = firebaseCollection(db, Collections.STUDENTS);

  static async getAllStudents(): Promise<Partial<Student>[]> {
    try {
      const res = (
        await getDocs(
          query(this.studentsCollection, orderBy("hours", "desc"))
        )
      ).docs;
      return res.map((doc) => {
        const { id, name, registrationNumber, hours } =
          doc.data() as Partial<Student>;
        return { id, name, registrationNumber, hours };
      });
    } catch {
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
