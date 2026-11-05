import { Collections } from "@/lib/constants";
import { db } from "@/lib/firebase";
import { ImageService } from "./image";
import { compressExistingDataUrl } from "@/lib/compressImage";
import {
  Role,
  type HourRequest,
  type HourRequestInput,
  type RequestStatus,
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
  runTransaction,
  updateDoc,
  where,
  deleteDoc,
  deleteField,
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
      let proofData = null;

      if (formData.file) {
        const tempId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        proofData = await ImageService.uploadImage(formData.file, tempId);
      }

      const obj = {
        workName: formData.workName,
        workSlab: formData.workSlab,
        workType: formData.workType,
        date: formData.date,
        description: formData.description,
        hours: formData.hours,
        status: "pending",
        proof: proofData,
        name: user.name,
        registrationNumber: user.registrationNumber,
        submitted: date.toISOString().split("T")[0],
      };

      await addDoc(this.collection, obj);
      return { success: true };
    } catch (error) {
      console.error("Submit request error:", error);
      throw typeof error === "string"
        ? error
        : "The request could not be submitted. Please try again later";
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

  /**
   * Primary comprehensive method to update any request details:
   * - changes hours
   * - switches status (pending <-> approved <-> rejected)
   * - updates work date
   * - adds or edits admin remarks
   * - replaces or removes proof image
   * Automatically keeps student balance in exact sync.
   */
  static async updateRequestDetails(
    id: string,
    params: {
      hours: number;
      status: RequestStatus;
      date?: string;
      remark?: string;
      newProofFile?: File | null;
      removeProof?: boolean;
    }
  ): Promise<{ success: true }> {
    try {
      if (!Number.isFinite(params.hours) || params.hours < 0) {
        throw "Hours must be a non-negative number";
      }

      const proofData = params.newProofFile
        ? await ImageService.uploadImage(params.newProofFile, id)
        : undefined;
      const ref = doc(this.collection, id);
      const initialRequestSnap = await getDoc(ref);
      if (!initialRequestSnap.exists()) {
        throw "Request not found";
      }

      const initialRegistrationNumber =
        initialRequestSnap.data().registrationNumber as string | undefined;
      const initialStudentSnap = initialRegistrationNumber
        ? await getDocs(
            query(
              this.studentsCollection,
              where("registrationNumber", "==", initialRegistrationNumber)
            )
          )
        : undefined;
      const transitionTimestamp = new Date().toISOString();

      await runTransaction(db, async (transaction) => {
        const requestSnap = await transaction.get(ref);
        if (!requestSnap.exists()) {
          throw "Request not found";
        }

        const currentData = requestSnap.data();
        const oldStatus = currentData.status || "pending";
        const oldHours = currentData.hours ?? 0;
        const balanceDiff =
          oldStatus === "approved"
            ? params.status === "approved"
              ? params.hours - oldHours
              : -oldHours
            : params.status === "approved"
              ? params.hours
              : 0;

        const updateData: Record<string, unknown> = {
          hours: params.hours,
          status: params.status,
        };

        if (params.date !== undefined) {
          updateData.date = params.date;
        }
        if (params.remark !== undefined) {
          updateData.remark = params.remark.trim();
        }

        if (params.status === "approved") {
          updateData.approved =
            oldStatus === "approved"
              ? currentData.approved || transitionTimestamp
              : transitionTimestamp;
          updateData.rejected = deleteField();
        } else if (params.status === "rejected") {
          updateData.rejected =
            oldStatus === "rejected"
              ? currentData.rejected || transitionTimestamp
              : transitionTimestamp;
          updateData.approved = deleteField();
        } else {
          updateData.approved = deleteField();
          updateData.rejected = deleteField();
        }

        if (proofData) {
          updateData.proof = proofData;
        } else if (params.removeProof) {
          updateData.proof = null;
        }

        let studentRef;
        if (balanceDiff !== 0) {
          const registrationNumber = currentData.registrationNumber;
          if (
            !registrationNumber ||
            registrationNumber !== initialRegistrationNumber
          ) {
            throw "Cannot update student hours: request has no registration number";
          }
          if (!initialStudentSnap || initialStudentSnap.empty) {
            throw "Cannot update student hours: student was not found";
          }
          studentRef = initialStudentSnap.docs[0].ref;
          const studentSnap = await transaction.get(studentRef);
          if (!studentSnap.exists()) {
            throw "Cannot update student hours: student was not found";
          }
        }

        transaction.update(ref, updateData);
        if (studentRef) {
          transaction.update(studentRef, {
            hours: increment(balanceDiff),
          });
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating request details:", error);
      throw typeof error === "string" ? error : "Could not update request details";
    }
  }

  static async handleRequestAction(
    id: string,
    action: RequestStatus,
    modifiedHours?: number,
    _newProofData?: { url: string; path: string } | null,
    removeProof?: boolean,
    remark?: string,
    date?: string
  ) {
    const snap = await getDoc(doc(this.collection, id));
    if (!snap.exists()) {
      throw "Request not found";
    }
    const hours = modifiedHours ?? (snap.exists() ? snap.data().hours ?? 0 : 0);
    const existingDate = snap.exists() ? snap.data().date : undefined;
    const existingRemark = snap.exists() ? snap.data().remark : undefined;

    return this.updateRequestDetails(id, {
      hours,
      status: action,
      date: date || existingDate,
      remark: remark !== undefined ? remark : existingRemark,
      removeProof,
    });
  }

  static async updateApprovedRequest(
    id: string,
    newHours: number,
    newProofFile?: File | null,
    removeProof?: boolean,
    remark?: string,
    date?: string
  ) {
    return this.updateRequestDetails(id, {
      hours: newHours,
      status: "approved",
      date,
      remark,
      newProofFile,
      removeProof,
    });
  }

  static async updateRequestProof(
    id: string,
    newFile: File
  ): Promise<{ success: boolean; proofUrl: string }> {
    const proofData = await ImageService.uploadImage(newFile, id);
    const ref = doc(this.collection, id);
    await updateDoc(ref, { proof: proofData });
    return { success: true, proofUrl: proofData.url };
  }

  /**
   * Scans all stored hour requests in Cloud Firestore and recompresses any heavy
   * legacy Base64 images down to compact ~25KB - 40KB JPEGs.
   */
  static async compressOldRequestsProofs(): Promise<{
    totalChecked: number;
    totalCompressed: number;
    kbSaved: number;
  }> {
    try {
      const snap = await getDocs(this.collection);
      let totalChecked = 0;
      let totalCompressed = 0;
      let kbSaved = 0;

      for (const docSnap of snap.docs) {
        totalChecked++;
        const data = docSnap.data();
        const proofUrl =
          typeof data.proof === "string" ? data.proof : data.proof?.url;

        if (
          proofUrl &&
          typeof proofUrl === "string" &&
          proofUrl.startsWith("data:image/")
        ) {
          const oldLength = proofUrl.length;
          // If larger than ~50KB in base64 string length
          if (oldLength > 50 * 1024) {
            try {
              const compressedUrl = await compressExistingDataUrl(proofUrl);
              const newLength = compressedUrl.length;
              if (newLength < oldLength) {
                await updateDoc(docSnap.ref, {
                  proof: {
                    url: compressedUrl,
                    path: data.proof?.path || `proofs/${docSnap.id}.jpg`,
                  },
                });
                totalCompressed++;
                kbSaved += Math.round((oldLength - newLength) / 1024);
              }
            } catch (e) {
              console.warn(`Could not compress proof for doc ${docSnap.id}:`, e);
            }
          }
        }
      }

      return { totalChecked, totalCompressed, kbSaved };
    } catch (error) {
      console.error("Batch compression error:", error);
      throw typeof error === "string" ? error : "Could not compress old proofs";
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
