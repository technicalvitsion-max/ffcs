import { Collections } from "@/lib/constants";
import { db, firebaseConfig } from "@/lib/firebase";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  addDoc,
} from "firebase/firestore";
import * as XLSX from "xlsx";

export interface ParsedStudentRow {
  registrationNumber: string;
  name: string;
  email: string;
  mobile: string;
}

export interface UploadProgress {
  current: number;
  total: number;
  currentStudent: string;
  status: "idle" | "parsing" | "uploading" | "completed" | "error";
  error?: string;
}

export class RosterService {
  /**
   * Parse a CSV or XLSX file and extract clean student records
   */
  static async parseFile(file: File): Promise<ParsedStudentRow[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Read rows as array of objects
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    if (rows.length === 0) {
      throw new Error("The uploaded spreadsheet is empty.");
    }

    const parsed: ParsedStudentRow[] = [];

    for (const row of rows) {
      // Find matching keys dynamically for flexibility
      let regNo = "";
      let name = "";
      let email = "";
      let mobile = "";

      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = key.trim().toLowerCase();
        const strVal = String(value ?? "").trim();

        if (
          normalizedKey.includes("reg") ||
          normalizedKey === "register no" ||
          normalizedKey === "registration number"
        ) {
          regNo = strVal.toUpperCase();
        } else if (
          normalizedKey.includes("name") ||
          normalizedKey === "student name"
        ) {
          name = strVal;
        } else if (normalizedKey.includes("mail")) {
          email = strVal.toLowerCase();
        } else if (
          normalizedKey.includes("mob") ||
          normalizedKey.includes("phone") ||
          normalizedKey.includes("contact")
        ) {
          mobile = strVal;
        }
      }

      if (regNo && email) {
        parsed.push({
          registrationNumber: regNo,
          name: name || regNo,
          email,
          mobile,
        });
      }
    }

    if (parsed.length === 0) {
      throw new Error(
        "Could not detect student records. Make sure the CSV has 'Register No', 'Name', 'Email', and 'Mob No' headers."
      );
    }

    return parsed;
  }

  /**
   * Upload students to Firebase Auth & Cloud Firestore
   */
  static async uploadRoster(
    students: ParsedStudentRow[],
    uploaderName: string,
    uploadYear: number,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; created: number; updated: number; errors: string[] }> {
    // Secondary Firebase instance so the logged-in admin isn't signed out
    const secondaryAppName = `roster-uploader-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    const studentsCol = collection(db, Collections.STUDENTS);

    try {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];

        onProgress?.({
          current: i + 1,
          total: students.length,
          currentStudent: `${student.name} (${student.registrationNumber})`,
          status: "uploading",
        });

        // 1. Initial default password: Student's Registration Number (e.g., 25BAI1218)
        const defaultPassword = student.registrationNumber;

        let authUid: string | null = null;

        try {
          // Attempt to create user in Firebase Auth
          const userCred = await createUserWithEmailAndPassword(
            secondaryAuth,
            student.email,
            defaultPassword
          );
          authUid = userCred.user.uid;
          await signOut(secondaryAuth);
          createdCount++;
        } catch (authError: unknown) {
          const err = authError as { code?: string; message?: string };
          if (err.code === "auth/email-already-in-use") {
            // Already has an auth account, will update Firestore record
            updatedCount++;
          } else {
            console.warn(`Auth creation failed for ${student.email}:`, err);
            errors.push(`${student.registrationNumber} (${student.email}): ${err.message || "Auth error"}`);
          }
        }

        // 2. Check if student already exists in Firestore by registrationNumber
        const existingQuery = query(
          studentsCol,
          where("registrationNumber", "==", student.registrationNumber)
        );
        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
          // Existing student doc - preserve existing hours
          const existingDoc = existingSnap.docs[0];
          const existingData = existingDoc.data();

          await setDoc(
            doc(db, Collections.STUDENTS, existingDoc.id),
            {
              ...existingData,
              name: student.name,
              email: student.email,
              mobile: student.mobile,
              registrationNumber: student.registrationNumber,
              academicYear: uploadYear,
              ...(authUid ? { id: authUid } : {}),
            },
            { merge: true }
          );
        } else {
          // New student doc
          const docId = authUid || `${student.registrationNumber}_${Date.now()}`;
          await setDoc(doc(db, Collections.STUDENTS, docId), {
            id: authUid || docId,
            name: student.name,
            email: student.email,
            mobile: student.mobile,
            registrationNumber: student.registrationNumber,
            hours: 0,
            academicYear: uploadYear,
          });
        }
      }

      // Record in uploadHistory
      try {
        await addDoc(collection(db, Collections.UPLOAD_HISTORY), {
          uploaderName,
          uploadYear,
          totalStudents: students.length,
          uploadedAt: new Date().toISOString(),
          createdCount,
          updatedCount,
        });
      } catch (histErr) {
        console.warn("Could not save to uploadHistory:", histErr);
      }

      onProgress?.({
        current: students.length,
        total: students.length,
        currentStudent: "Completed!",
        status: "completed",
      });

      return {
        success: true,
        created: createdCount,
        updated: updatedCount,
        errors,
      };
    } finally {
      // Clean up secondary app
      try {
        await deleteApp(secondaryApp);
      } catch {
        // Ignore deletion errors
      }
    }
  }
}
