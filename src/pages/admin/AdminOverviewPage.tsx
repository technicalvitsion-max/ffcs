import { useEffect, useState } from "react";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useAdminView, type AdminViewContextType } from "@/context/AdminViewContext";
import { StudentsService } from "@/services/students";
import { RequestsService } from "@/services/requests";
import type { Student, HourRequest } from "@/lib/types";
import * as XLSX from "xlsx";
import {
  UsersIcon,
  ClockIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  DownloadIcon,
  TrendingUpIcon,
  CheckIcon,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminOverviewPage() {
  const { user } = useAuth() as AuthContextType;
  const { setView } = useAdminView() as AdminViewContextType;

  const [students, setStudents] = useState<Partial<Student>[]>([]);
  const [requests, setRequests] = useState<HourRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsData, requestsData] = await Promise.all([
          StudentsService.getAllStudents(),
          user ? RequestsService.getHourRequests(user) : Promise.resolve([]),
        ]);
        setStudents(studentsData);
        setRequests(requestsData);
      } catch (err) {
        console.error("Error loading overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Derived metrics
  const totalStudents = students.length;
  const fullCapacityStudents = students.filter((s) => (s.hours || 0) >= 90);
  const pendingRequests = requests.filter((r) => r.status === "pending");

  // Progress brackets (75h Pass, 90h = 100%)
  const tierFull = fullCapacityStudents.length;
  const tierPassed = students.filter((s) => (s.hours || 0) >= 75 && (s.hours || 0) < 90).length;
  const tierNearPass = students.filter((s) => (s.hours || 0) >= 45 && (s.hours || 0) < 75).length;
  const tierBelowPass = students.filter((s) => (s.hours || 0) > 0 && (s.hours || 0) < 45).length;
  const tierZero = students.filter((s) => !s.hours || s.hours === 0).length;

  const handleExportExcel = () => {
    if (!students.length) return;

    const dataToExport = students.map((s) => ({
      "Register No": s.registrationNumber || "",
      "Name": s.name || "",
      "Total Hours": s.hours || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FFCS Hours Report");
    XLSX.writeFile(workbook, `VITSION_FFCS_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a] text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#161616] via-[#121212] to-[#161616] p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Executive Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              VITSION Club Admin
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1 max-w-xl">
              Track FFCS member contributions, verify work proofs, and monitor club completion metrics for 2026–2027.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={students.length === 0}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-gray-200 transition-all hover:scale-105 disabled:opacity-50"
            >
              <DownloadIcon className="w-4 h-4 text-gray-300" />
              Export Roster (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Total Members Metric Card */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => setView("students")}
          className="bg-[#121212] p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all cursor-pointer group shadow-xl max-w-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Members
            </span>
            <div className="p-2.5 bg-white/5 text-gray-300 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
              <UsersIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-white tracking-tight mb-1">
            {loading ? "..." : totalStudents}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Enrolled in FFCS &bull; Click to view directory</span>
            <ArrowRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Tier Breakdown */}
        <div className="bg-[#121212] p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5 text-gray-400" />
                FFCS Completion Distribution
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                75h is the official Pass mark &bull; 90h represents 100% goal
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 90+ hours (100% Goal) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-white flex items-center gap-1.5">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-gray-400" />
                  100% Completed (90+ hrs)
                </span>
                <span className="text-gray-300 font-mono">
                  {tierFull} ({totalStudents > 0 ? Math.round((tierFull / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (tierFull / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* 75-89 hours (Passed) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-200 flex items-center gap-1.5">
                  <CheckIcon className="w-3.5 h-3.5 text-gray-400" />
                  Passed FFCS (75–89 hrs)
                </span>
                <span className="text-gray-300 font-mono">
                  {tierPassed} ({totalStudents > 0 ? Math.round((tierPassed / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gray-300 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (tierPassed / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* 45-74 hours (Near Pass / In Progress) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-300">Near Pass / In Progress (45–74 hrs)</span>
                <span className="text-gray-300 font-mono">
                  {tierNearPass} ({totalStudents > 0 ? Math.round((tierNearPass / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gray-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (tierNearPass / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* 1-44 hours (Below Pass) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-400">Below Pass (1–44 hrs)</span>
                <span className="text-gray-400 font-mono">
                  {tierBelowPass} ({totalStudents > 0 ? Math.round((tierBelowPass / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gray-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (tierBelowPass / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* 0 hours */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-gray-500">Zero Contributions (0 hrs)</span>
                <span className="text-gray-500 font-mono">
                  {tierZero} ({totalStudents > 0 ? Math.round((tierZero / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gray-700 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalStudents > 0 ? (tierZero / totalStudents) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Submissions Queue */}
        <div className="bg-[#121212] p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                Recent Pending Submissions
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Review student proof and approval requests
              </p>
            </div>
            {pendingRequests.length > 0 && (
              <button
                onClick={() => setView("requests")}
                className="text-xs font-bold text-white hover:underline flex items-center gap-1"
              >
                View All ({pendingRequests.length})
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <CheckIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No Pending Submissions</p>
              <p className="text-xs text-gray-400 mt-0.5">All student requests have been processed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between transition-colors text-sm"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {req.name}
                      <span className="text-xs font-mono text-gray-400">
                        ({req.registrationNumber})
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {req.workName} &bull; <span className="text-white font-medium">{req.hours} Hours</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setView("requests")}
                    className="px-3.5 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
