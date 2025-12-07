import { Collections } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { ImageService } from "./image";
import {
  Role,
  type HourRequest,
  type HourRequestInput,
  type User,
} from "@/lib/types";
import {
  addDoc,
  doc,
  collection as firebaseCollection,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
  deleteDoc,
} from "firebase/firestore";

export class RequestsService {
  static collection = firebaseCollection(db, Collections.HOUR_REQUESTS);
  static studentsCollection = firebaseCollection(db, Collections.STUDENTS);

  static async submitNewRequest(
    formData: HourRequestInput,
    user: Partial<User>
  ): Promise<{ success: boolean }> {
    try {
      const date = new Date();
      const obj = {
        workName: formData.workName,
        workSlab: formData.workSlab,
        workType: formData.workType,
        date: formData.date,
        description: formData.description,
        hours: formData.hours,
        status: "pending",
        proof: null,
        name: user.name,
        registrationNumber: user.registrationNumber,
        submitted: date.toISOString().split("T")[0],
      };

      // const res = await db.collection(Collections.HOUR_REQUESTS).add(obj);
      const res = await addDoc(this.collection, obj);
      if (formData.file) {
        const uploadResult = await ImageService.uploadImage(
          formData.file,
          res.id
        );
        await updateDoc(doc(db, Collections.HOUR_REQUESTS, res.id), {
          proof: uploadResult,
        });
      }
      return { success: true };
    } catch {
      throw "The request could not be submitted. Please try again later";
    }
  }

  static async getHourRequests(user: Partial<User>): Promise<HourRequest[]> {
    try {
      const role = user.role;

      let snap;
      if (role == Role.ADMIN) {
        snap = await getDocs(this.collection);
      } else {
        snap = await getDocs(
          query(
            this.collection,
            where("registrationNumber", "==", user.registrationNumber)
          )
        );
      }
      const result = snap.docs.map((doc) => {
        return { id: doc.id, ...doc.data() };
      }) as unknown as HourRequest[];

      return result;
    } catch (error) {
      console.log(error);
      throw "Could not fetch hour requests";
    }
  }

  static async getHourRequestsByRegistrationNumber(
    registrationNumber: string
  ): Promise<HourRequest[]> {
    try {
      const res = (
        await getDocs(
          query(
            this.collection,
            where("registrationNumber", "==", registrationNumber)
          )
        )
      ).docs;
      if (res.length === 0) return [];
      return res.map((r) => {
        return { id: r.id, ...r.data() } as unknown as HourRequest;
      });
    } catch {
      throw "Could not fetch hour requests";
    }
  }

  static async handleRequestAction(
    id: string,
    action: string,
    modifiedHours?: number
  ) {
    try {
      const ref = doc(this.collection, id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: "Request not found" };
      }

      const { hours: originalHours, registrationNumber, proof } = snap.data();
      const finalHours = modifiedHours ?? originalHours;

      // 2. Update the request status
      const date = new Date();
      const formatted = date.toISOString().split("T")[0];
      const newData: {
        status: string;
        approved?: string;
        rejected?: string;
        hours?: number;
      } = { status: action };

      if (modifiedHours !== undefined) {
        newData.hours = modifiedHours;
      }

      if (action === "approved") {
        newData.approved = formatted;
      } else if (action === "rejected") {
        newData.rejected = formatted;
      }

      await Promise.all([
        updateDoc(ref, newData),
        proof && ImageService.deleteImage(proof.path),
      ]);

      // 3. If approved → increment hours for student
      if (action === "approved") {
        const studentQuery = query(
          this.studentsCollection,
          where("registrationNumber", "==", registrationNumber)
        );

        const studentSnap = await getDocs(studentQuery);

        if (!studentSnap.empty) {
          await updateDoc(studentSnap.docs[0].ref, {
            hours: increment(finalHours),
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      throw "Could not update request status";
    }
  }

  static async updateApprovedRequest(id: string, newHours: number) {
    try {
      const ref = doc(this.collection, id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: "Request not found" };
      }

      const { hours: oldHours, registrationNumber } = snap.data();
      const diff = newHours - oldHours;

      if (diff === 0) return { success: true };

      // Update request
      await updateDoc(ref, { hours: newHours });

      // Update student balance
      const studentQuery = query(
        this.studentsCollection,
        where("registrationNumber", "==", registrationNumber)
      );
      const studentSnap = await getDocs(studentQuery);

      if (!studentSnap.empty) {
        await updateDoc(studentSnap.docs[0].ref, {
          hours: increment(diff),
        });
      }

      return { success: true };
    } catch (error) {
      console.log(error);
      throw "Could not update approved request";
    }
  }

  static async deleteRequest(id: string) {
    try {
      const ref = doc(this.collection, id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: "Request not found" };
      }

      const { hours, status, registrationNumber, proof } = snap.data();

      // If approved, verify and decrement student hours
      if (status === "approved") {
        const studentQuery = query(
          this.studentsCollection,
          where("registrationNumber", "==", registrationNumber)
        );
        const studentSnap = await getDocs(studentQuery);

        if (!studentSnap.empty) {
          await updateDoc(studentSnap.docs[0].ref, {
            hours: increment(-hours),
          });
        }
      }

      // Delete image if exists (and not already deleted logic... wait, handleRequestAction deletes proof image ref but maybe logic needs check. proof might be null if handled?)
      // Actually usually proof is nuked on approval/rejection per current logic: `proof && ImageService.deleteImage(proof.path)`.
      // So if status is pending, proof might exist. If approved/rejected, proof is likely null/undefined in DB or handled.
      // Let's check safely.
      if (proof) {
        await ImageService.deleteImage(proof.path);
      }

      await deleteDoc(ref);

      return { success: true };
    } catch (error) {
      console.log(error);
      throw "Could not delete request";
    }
  }
}
