"use client";
import { type HourRequest } from "@/lib/types";
import { PlusIcon, UserIcon, GraduationCapIcon, FileSpreadsheetIcon } from "lucide-react";
import HoursSummary from "@/components/student/HoursSummaryComponent";
import WorkHistoryTable from "@/components/student/WorkHistoryTable";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

type Props = {
  totalHours: number;
  remainingHours: number;
  progressPercentage: number;
  hourRequests: HourRequest[];
};

export default function StudentDashboardContent({
  totalHours,
  remainingHours,
  progressPercentage,
  hourRequests,
}: Props) {
  // Mock Session for Preview
  const navigate = useNavigate();

  const { user } = useAuth() as AuthContextType;

  const handleDownloadExcel = () => {
    const approvedRequests = hourRequests.filter(
      (req) => req.status === "approved"
    );

    if (approvedRequests.length === 0) return;

    const dataToExport = approvedRequests.map((req) => ({
      "Work Name": req.workName,
      "Slab": req.workSlab,
      "Type": req.workType,
      "Date": req.date,
      "Hours": req.hours,
      "Submitted On": req.submitted,
      "Approved On": req.approved,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Hours");
    XLSX.writeFile(workbook, "Approved_Work_History.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#121212] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{user!.name}</span>
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold border border-white/10 uppercase tracking-wide backdrop-blur-md">
                <GraduationCapIcon className="w-3.5 h-3.5" />
                Student
              </span>
              <span className="text-sm text-gray-400 font-medium flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                ID: {user!.registrationNumber}
              </span>
            </div>
          </div>

          <div className="relative z-10">
            <button
              onClick={() => navigate("/dashboard/request")}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-full shadow-xl transition-all duration-200 active:scale-95 transform hover:-translate-y-1"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Request</span>
            </button>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HoursSummary
            totalHours={totalHours}
            remainingHours={remainingHours}
            progressPercentage={progressPercentage}
          />
        </motion.div>

        {/* Work History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#121212] rounded-[2.5rem] shadow-xl border border-white/10 overflow-hidden"
        >
          <div className="p-8 sm:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Work History</h3>
              <p className="text-gray-400 text-sm mt-1">
                Track the status of your submissions
              </p>
            </div>
            {hourRequests.some((req) => req.status === "approved") && (
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/5 transition-colors group"
              >
                <FileSpreadsheetIcon className="w-4 h-4 text-green-500 group-hover:text-green-400 transition-colors" />
                Download Excel
              </button>
            )}
          </div>

          <WorkHistoryTable data={hourRequests} />
        </motion.div>
      </div>
    </div>
  );
}
