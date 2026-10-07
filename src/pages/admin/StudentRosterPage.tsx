import {
  UploadIcon,
  FileSpreadsheetIcon,
  UserIcon,
  CalendarIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  DownloadIcon,
  ShieldCheckIcon,
  LockIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  LogOutIcon,
  MailIcon,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  RosterService,
  type ParsedStudentRow,
  type UploadProgress,
} from "@/services/roster";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const OTP_SESSION_KEY = "vitsion_roster_otp_verified";
const DEFAULT_ROSTER_PIN = import.meta.env.VITE_ROSTER_SECURITY_PIN || "";
const ROSTER_ADMIN_EMAIL = import.meta.env.VITE_ROSTER_ADMIN_EMAIL || "";
const ROSTER_MAIL_TRIGGER_URL = import.meta.env.VITE_ROSTER_MAIL_TRIGGER_URL || "";
const ROSTER_MAIL_TRIGGER_URL_2 = import.meta.env.VITE_ROSTER_MAIL_TRIGGER_URL_2 || "";

export default function StudentsRosterPage() {
  const { user } = useAuth() as AuthContextType;
  const adminTargetEmail = ROSTER_ADMIN_EMAIL || user?.email || "";

  // Security OTP / PIN state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem(OTP_SESSION_KEY) === "true";
  });
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeOtp, setActiveOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Roster Upload state
  const [uploadYear, setUploadYear] = useState<number>(new Date().getFullYear());
  const [uploaderName, setUploaderName] = useState<string>(user?.name || "Admin");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isUploading = uploadProgress?.status === "uploading";

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Request / Trigger OTP to admin email from environment
  const handleRequestOtp = async () => {
    if (cooldown > 0 || isSendingOtp) return;

    if (!adminTargetEmail) {
      setOtpError("No administrator email configured in environment.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtp(generated);
    setOtpSent(true);
    setCooldown(60);

    const subject = "VITSION FFCS - Student Roster Access Security Code";
    const textBody = `Your 6-digit verification code to access and manage the student roster is: ${generated}. This code is valid for 10 minutes.`;
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #ffffff; border-radius: 12px; max-width: 500px;">
        <h2 style="color: #6366f1; margin-top: 0;">VITSION FFCS Security Verification</h2>
        <p style="color: #cbd5e1; font-size: 14px;">An access request was initiated for the Student Roster module.</p>
        <div style="margin: 20px 0; padding: 16px; background: #1e1b4b; border: 1px solid #4338ca; border-radius: 8px; text-align: center;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #a5b4fc; font-family: monospace;">${generated}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">This one-time passcode is valid for 10 minutes.</p>
      </div>
    `;

    try {
      // 1. Google Apps Script Web App Dispatch (supports primary and secondary URL 2 for 100/day quota failover)
      const triggerUrls: string[] = [
        ...((ROSTER_MAIL_TRIGGER_URL || "").split(",")),
        ...((ROSTER_MAIL_TRIGGER_URL_2 || "").split(",")),
      ]
        .map((u: string) => u.trim())
        .filter(Boolean);

      for (const url of triggerUrls) {
        try {
          await fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "text/plain",
            },
            body: JSON.stringify({
              to: adminTargetEmail,
              subject: subject,
              text: textBody,
              html: htmlBody,
              otp: generated,
            }),
          });
          break; // Primary succeeded
        } catch (scriptErr) {
          console.warn(`Apps Script dispatch failed for ${url}, trying fallback if available...`, scriptErr);
        }
      }

      // 2. Also record in Firestore mail collection (for backup / audit trail)
      await addDoc(collection(db, "mail"), {
        to: [adminTargetEmail],
        message: {
          subject: subject,
          text: textBody,
          html: htmlBody,
        },
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("Could not queue to Firestore mail collection:", err);
    } finally {
      setIsSendingOtp(false);
    }

    // Crucial: NEVER display the OTP code on screen!
    setOtpNotice(
      `A 6-digit verification code has been dispatched to ${adminTargetEmail}. Please check your inbox (and spam folder) and enter the code below.`
    );

    // Auto-focus first input
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  // Handle individual OTP digit input
  const handleOtpDigitChange = (index: number, value: string) => {
    setOtpError(null);

    // Handle paste of full 6-digit code
    if (value.length > 1) {
      const cleanPasted = value.replace(/\D/g, "").slice(0, 6);
      if (cleanPasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleanPasted[i] || "";
        }
        setOtpDigits(newDigits);
        const focusIdx = Math.min(cleanPasted.length, 5);
        otpInputRefs.current[focusIdx]?.focus();
        return;
      }
    }

    const char = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto focus next input
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify entered PIN / OTP
  const handleVerifyOtp = () => {
    const entered = otpDigits.join("");
    if (entered.length < 6) {
      setOtpError("Please enter all 6 digits of the security PIN or OTP.");
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const isPinValid = Boolean(DEFAULT_ROSTER_PIN && entered === DEFAULT_ROSTER_PIN);
      const isOtpValid = Boolean(activeOtp && entered === activeOtp);

      if (isPinValid || isOtpValid) {
        sessionStorage.setItem(OTP_SESSION_KEY, "true");
        setIsAuthorized(true);
        setOtpError(null);
        setOtpNotice(null);
      } else {
        setOtpError("Invalid verification code or security PIN. Please check and try again.");
      }
      setIsVerifying(false);
    }, 350);
  };

  const handleLockSession = () => {
    sessionStorage.removeItem(OTP_SESSION_KEY);
    setIsAuthorized(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setActiveOtp(null);
    setOtpSent(false);
    setOtpNotice(null);
  };

  // Download Default Template (CSV or XLSX)
  const handleDownloadTemplate = (format: "csv" | "xlsx" = "csv") => {
    const sampleRows = [
      {
        "Register No": "25BAI1218",
        "Name": "SURENDAR S",
        "Email": "surendar.s2025@vitstudent.ac.in",
        "Mob No": "9632650576",
      },
      {
        "Register No": "25BAI1548",
        "Name": "PRAJITH B",
        "Email": "prajith.b2025@vitstudent.ac.in",
        "Mob No": "6381264988",
      },
      {
        "Register No": "24BCE1121",
        "Name": "PRASANNA S",
        "Email": "prasanna.s2024a@vitstudent.ac.in",
        "Mob No": "6382136475",
      },
      {
        "Register No": "25BBH1005",
        "Name": "SANJITHAA J",
        "Email": "sanjithaa.j2025@vitstudent.ac.in",
        "Mob No": "9677248250",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FFCS Members Roster");

    if (format === "csv") {
      XLSX.writeFile(workbook, "VITSION_FFCS_Roster_Template.csv", { bookType: "csv" });
    } else {
      XLSX.writeFile(workbook, "VITSION_FFCS_Roster_Template.xlsx");
    }
  };

  // File parsing
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setUploadResult(null);
    setUploadProgress(null);

    try {
      const parsed = await RosterService.parseFile(file);
      setParsedStudents(parsed);
    } catch (err: unknown) {
      setParsedStudents([]);
      setParseError((err as Error).message || "Failed to parse spreadsheet file");
    }
  };

  // Start Onboarding Process
  const handleStartUpload = async () => {
    if (!parsedStudents.length || isUploading) return;
    setUploadResult(null);

    try {
      const result = await RosterService.uploadRoster(
        parsedStudents,
        uploaderName,
        uploadYear,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      setUploadResult(result);
    } catch (err: unknown) {
      setUploadProgress({
        current: 0,
        total: parsedStudents.length,
        currentStudent: "",
        status: "error",
        error: (err as Error).message || "Upload process failed",
      });
    }
  };

  // --- RENDER OTP SECURITY GATE IF NOT AUTHORIZED ---
  if (!isAuthorized) {
    return (
      <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#121212] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 max-w-lg w-full relative overflow-hidden"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20"></div>

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-inner">
              <LockIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Roster Security Verification
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Managing bulk student rosters and credentials requires 2-Step OTP authorization.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs font-mono text-gray-400 mt-3">
              <KeyRoundIcon className="w-3.5 h-3.5 text-indigo-400" />
              Admin: <span className="text-white font-medium">{adminTargetEmail}</span>
            </div>
          </div>

          {/* OTP notification banner */}
          <AnimatePresence>
            {otpNotice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 mb-6 text-xs text-indigo-200 leading-relaxed flex items-start gap-3"
              >
                <ShieldCheckIcon className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-0.5">Verification Code Dispatched</p>
                  <p className="text-indigo-300 leading-relaxed">{otpNotice}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {otpError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-xs text-red-400 flex items-center gap-2">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">
                Enter 6-Digit Security PIN or OTP
              </label>
              <div className="flex justify-center gap-2.5 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 bg-[#0a0a0a] border border-white/10 rounded-xl text-center text-xl sm:text-2xl font-bold font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying || otpDigits.join("").length < 6}
              className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-4 h-4" />
                  Verify & Unlock Roster
                </>
              )}
            </button>

            {/* Trigger / Resend Email OTP */}
            <div className="pt-3 border-t border-white/5 space-y-2.5">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={cooldown > 0 || isSendingOtp}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOtp ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                    <span>Dispatching code to {adminTargetEmail}...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCwIcon className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Resend OTP in {cooldown}s</span>
                  </>
                ) : (
                  <>
                    <MailIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{otpSent ? "Resend OTP to" : "Send One-Time OTP to"} {adminTargetEmail}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-500 text-center">
                Use your administrator security PIN or request an email verification OTP.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- RENDER UNLOCKED STUDENT ROSTER ONBOARDING INTERFACE ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]"
    >
      <div className="bg-[#121212] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 max-w-3xl mx-auto relative overflow-hidden">
        {/* Top security session indicator */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            OTP Verified (Authorized Session)
          </div>
          <button
            onClick={handleLockSession}
            title="Lock access"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            Lock Roster
          </button>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <FileSpreadsheetIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Upload Student Roster
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                Bulk onboard FFCS members and automatically create accounts in Firebase.
              </p>
            </div>
          </div>

          {/* Download Default Format Template Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadTemplate("csv")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-colors"
              title="Download default CSV roster template"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-emerald-400" />
              Sample Template (.csv)
            </button>
            <button
              onClick={() => handleDownloadTemplate("xlsx")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-200 transition-colors"
              title="Download default XLSX roster template"
            >
              <DownloadIcon className="w-3.5 h-3.5 text-emerald-400" />
              .xlsx
            </button>
          </div>
        </div>

        {/* Expected Format Guidance Box */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Standard Expected File Columns
            </span>
            <span className="text-[11px] font-mono text-gray-500">Exact default schema</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-gray-300 text-center">
              Register No
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-gray-300 text-center">
              Name
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-gray-300 text-center">
              Email
            </div>
            <div className="bg-white/5 p-2 rounded-lg border border-white/5 text-gray-300 text-center">
              Mob No
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label
              htmlFor="uploaderName"
              className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide"
            >
              Uploader Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                id="uploaderName"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                disabled={isUploading}
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-600 transition-all font-medium disabled:opacity-50 text-sm"
                placeholder="Enter your name"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="uploadYear"
              className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide"
            >
              Academic Year
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="number"
                id="uploadYear"
                value={uploadYear}
                onChange={(e) =>
                  setUploadYear(Number(e.target.value) || new Date().getFullYear())
                }
                disabled={isUploading}
                className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-gray-600 transition-all font-medium disabled:opacity-50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`bg-[#0a0a0a] border border-dashed rounded-2xl p-8 text-center mb-6 transition-all cursor-pointer group ${
            isUploading
              ? "opacity-50 cursor-not-allowed border-white/10"
              : "border-white/20 hover:border-white/40 hover:bg-white/5"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".csv, .xlsx, .xls"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white/5 rounded-full shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <UploadIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-white font-bold group-hover:underline">
                {selectedFile ? selectedFile.name : "Click to select roster file"}
              </span>{" "}
              <span className="text-gray-500">or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500 font-mono bg-white/5 px-2.5 py-1 rounded-md">
              Supports CSV & XLSX files (e.g. all ffcs members '26-27)
            </p>
          </div>
        </div>

        {/* Informational tip */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-200/90 leading-relaxed">
            <strong>Default Credentials:</strong> Each student account is created in Firebase Auth with their initial password set to their <strong>Registration Number</strong> (e.g. <code className="bg-blue-900/40 px-1 py-0.5 rounded">25BAI1218</code>). Students can log in using either their <strong>Registration Number</strong> or <strong>Email</strong>.
          </div>
        </div>

        {/* Error message */}
        {parseError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircleIcon className="w-5 h-5 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Parsed Preview Table */}
        {parsedStudents.length > 0 && !isUploading && !uploadResult && (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-white">
                Detected {parsedStudents.length} Students
              </span>
              <span className="text-xs text-gray-500">Preview (First 3)</span>
            </div>
            <div className="space-y-2">
              {parsedStudents.slice(0, 3).map((st, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs text-gray-300"
                >
                  <div>
                    <span className="font-bold text-white mr-2">
                      {st.registrationNumber}
                    </span>
                    <span>{st.name}</span>
                  </div>
                  <span className="text-gray-500 hidden sm:inline">
                    {st.email}
                  </span>
                </div>
              ))}
              {parsedStudents.length > 3 && (
                <p className="text-xs text-center text-gray-500 pt-1">
                  ...and {parsedStudents.length - 3} more students ready to import
                </p>
              )}
            </div>
          </div>
        )}

        {/* Real-time Progress Bar */}
        {isUploading && uploadProgress && (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-white">
                Importing: {uploadProgress.current} / {uploadProgress.total} students
              </span>
              <span className="text-sm font-mono text-gray-400">
                {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-3">
              <motion.div
                className="bg-white h-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-xs text-gray-400 truncate">
              Current: <span className="text-white">{uploadProgress.currentStudent}</span>
            </p>
          </div>
        )}

        {/* Upload Success Report */}
        {uploadResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2Icon className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-emerald-300 text-lg">
                Roster Import Completed!
              </h4>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              All students have been registered in Firebase Auth and saved to Cloud Firestore.
            </p>
            <div className="flex gap-4 text-xs font-mono mt-3">
              <span className="bg-emerald-500/20 px-3 py-1 rounded-md text-emerald-200">
                Newly Created: {uploadResult.created}
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-md text-gray-300">
                Updated / Existing: {uploadResult.updated}
              </span>
            </div>
            {uploadResult.errors.length > 0 && (
              <details className="mt-4 text-xs text-amber-300 bg-amber-950/30 p-3 rounded-lg border border-amber-800/40">
                <summary className="cursor-pointer font-semibold">
                  {uploadResult.errors.length} warnings/notes (click to view)
                </summary>
                <ul className="mt-2 space-y-1 list-disc pl-4">
                  {uploadResult.errors.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleStartUpload}
            disabled={parsedStudents.length === 0 || isUploading || !uploaderName.trim()}
            className={`flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-95 ${
              parsedStudents.length === 0 || isUploading || !uploaderName.trim()
                ? "bg-gray-800 cursor-not-allowed text-gray-500"
                : "bg-white text-black hover:bg-gray-200 shadow-white/10"
            }`}
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>Importing Students...</span>
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                <span>Upload & Onboard Roster ({parsedStudents.length || 0})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
