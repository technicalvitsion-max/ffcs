import { type Student } from "@/lib/types";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchIcon,
  ChevronRightIcon,
  UserIcon,
  DownloadIcon,
  CheckCircle2Icon,
  FileTextIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { PDFReportService } from "@/services/pdfReport";
import { RequestsService } from "@/services/requests";

function StudentsTable({ students }: { students: Partial<Student>[] }) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "passed" | "full" | "fail" | "zero">("all");
  const [sortBy, setSortBy] = useState<"hoursDesc" | "hoursAsc" | "nameAsc">("hoursDesc");

  const navigate = useNavigate();

  // Filter & sort (75h Pass, 90h = 100%)
  const filteredAndSorted = useMemo(() => {
    let result = [...students];

    // Filter by category
    if (filterType === "full") {
      result = result.filter((s) => (s.hours || 0) >= 90);
    } else if (filterType === "passed") {
      result = result.filter((s) => (s.hours || 0) >= 75);
    } else if (filterType === "fail") {
      result = result.filter((s) => (s.hours || 0) < 75 && (s.hours || 0) > 0);
    } else if (filterType === "zero") {
      result = result.filter((s) => !s.hours || s.hours === 0);
    }

    // Text search
    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(lower)) ||
          (s.registrationNumber && s.registrationNumber.toLowerCase().includes(lower)) ||
          (s.email && s.email.toLowerCase().includes(lower)) ||
          (s.mobile && s.mobile.includes(lower))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "hoursDesc") return (b.hours || 0) - (a.hours || 0);
      if (sortBy === "hoursAsc") return (a.hours || 0) - (b.hours || 0);
      if (sortBy === "nameAsc") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

    return result;
  }, [students, query, filterType, sortBy]);

  const handleExportExcel = () => {
    if (!filteredAndSorted.length) return;

    const data = filteredAndSorted.map((s) => ({
      "Register No": s.registrationNumber || "",
      "Name": s.name || "",
      "Total Hours": s.hours || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, `VITSION_FFCS_Students_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const countPassed = students.filter((s) => (s.hours || 0) >= 75).length;
  const countFull = students.filter((s) => (s.hours || 0) >= 90).length;
  const countFail = students.filter((s) => (s.hours || 0) < 75 && (s.hours || 0) > 0).length;
  const countZero = students.filter((s) => !s.hours || s.hours === 0).length;

  return (
    <div className="bg-[#121212] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
      {/* Top Header & Search bar */}
      <div className="p-6 md:p-8 border-b border-white/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Student Directory
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Browse, monitor, and export contribution hours across all enrolled club members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportExcel}
              disabled={filteredAndSorted.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
            >
              <DownloadIcon className="w-4 h-4 text-emerald-400" />
              Export to Excel
            </button>
          </div>
        </div>

        {/* Filters and search inputs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "all"
                  ? "bg-white text-black shadow-sm"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              All ({students.length})
            </button>
            <button
              onClick={() => setFilterType("passed")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "passed"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Passed 75h+ ({countPassed})
            </button>
            <button
              onClick={() => setFilterType("full")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "full"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              100% Goal 90h+ ({countFull})
            </button>
            <button
              onClick={() => setFilterType("fail")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "fail"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              Fail / Under 75h ({countFail})
            </button>
            <button
              onClick={() => setFilterType("zero")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === "zero"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              0 Hours ({countZero})
            </button>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search name, ID, phone..."
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-white placeholder-gray-500 transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer"
              >
                <option value="hoursDesc">Highest Hours</option>
                <option value="hoursAsc">Lowest Hours</option>
                <option value="nameAsc">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-white/5">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Student
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Reg Number
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Progress toward 90h
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Approved Hours
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filteredAndSorted.map((student, index) => {
                const hours = student.hours || 0;
                const percentage = Math.min(100, Math.round((hours / 90) * 100));
                const isFull = hours >= 90;
                const isPassed = hours >= 75;

                return (
                  <motion.tr
                    key={student.registrationNumber || index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.3) }}
                    onClick={() => {
                      navigate(`/dashboard/student/${student.registrationNumber}`);
                    }}
                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs border border-white/10 group-hover:scale-105 transition-transform">
                          {student.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-gray-200 transition-colors">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-300">
                      {student.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[180px]">
                      <div className="w-full">
                        <div className="flex justify-between items-center text-[11px] mb-1 font-mono">
                          <span className={isPassed ? "text-emerald-400 font-bold" : "text-gray-400"}>
                            {hours} / 90 hrs
                          </span>
                          <span className={isPassed ? "text-emerald-400 font-bold" : "text-gray-500"}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull ? "bg-purple-400" : isPassed ? "bg-emerald-400" : percentage >= 50 ? "bg-amber-400" : "bg-white/30"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isFull ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          🏆 {hours}h (100% GOAL)
                        </span>
                      ) : isPassed ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2Icon className="w-3.5 h-3.5" />
                          {hours}h (PASSED)
                        </span>
                      ) : hours > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          FAIL (Need {75 - hours}h)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-500 border border-white/5">
                          0h (FAIL / 0%)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const requests = await RequestsService.getHourRequestsByRegistrationNumber(
                                student.registrationNumber || ""
                              );
                              PDFReportService.generateStudentReport(student as Student, requests);
                            } catch (err) {
                              console.error("PDF generation error:", err);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title={`Download PDF Report for ${student.name}`}
                        >
                          <FileTextIcon className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors inline-block" />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredAndSorted.length === 0 && (
          <div className="p-16 text-center text-gray-500">
            <UserIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-lg font-bold text-white">No students match filter</p>
            <p className="text-xs text-gray-500 mt-1">
              Try clearing your search or selecting a different category.
            </p>
          </div>
        )}
      </div>

      {/* Footer Count */}
      <div className="p-4 px-6 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <span>
          Showing <strong className="text-white">{filteredAndSorted.length}</strong> of {students.length} students
        </span>
        <span>Goal: 90 approved contribution hours</span>
      </div>
    </div>
  );
}

export default StudentsTable;
