import { StaticLoader } from "@/components/common/Loader";
import WorkHistoryTable from "@/components/student/WorkHistoryTable";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import type { HourRequest, Student } from "@/lib/types";
import { PASS_HOURS, TOTAL_WORK_HOURS } from "@/lib/constants";
import { RequestsService } from "@/services/requests";
import { StudentsService } from "@/services/students";
import { PDFReportService } from "@/services/pdfReport";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, DownloadIcon, CheckCircle2Icon, AlertCircleIcon, FileTextIcon } from "lucide-react";

function StudentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error, setError } = useError() as ErrorContextType;
  const [student, setStudent] = useState<Student | undefined>();
  const [hourRequests, setHourRequests] = useState<HourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    StudentsService.getStudentByRegistrationNumber(id as string)
      .then((data) => setStudent(data || undefined))
      .catch((err) => setError(err));

    RequestsService.getHourRequestsByRegistrationNumber(id as string)
      .then(setHourRequests)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id, setError]);

  const handleDownloadPDF = () => {
    if (!student) return;
    try {
      setIsExporting(true);
      PDFReportService.generateStudentReport(student, hourRequests);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (error) return <Navigate to={"/error"} replace />;
  if (loading || student == null) return <StaticLoader isVisible />;

  const isPassed = (student.hours || 0) >= PASS_HOURS;
  const progressPct = Math.min(100, Math.round(((student.hours || 0) / TOTAL_WORK_HOURS) * 100));

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
            Back to Directory
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white to-gray-200 text-black font-bold rounded-xl shadow-lg hover:from-gray-100 hover:to-gray-300 active:scale-95 transition-all text-sm disabled:opacity-50"
          >
            <DownloadIcon className="w-4 h-4 text-black" />
            {isExporting ? "Generating PDF..." : "Download PDF Report"}
          </button>
        </div>

        <div className="bg-[#121212] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white tracking-tight">{student.name}</h2>
                {isPassed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                    <CheckCircle2Icon className="w-3.5 h-3.5" />
                    PASSED (≥ {PASS_HOURS}h)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                    IN PROGRESS ({PASS_HOURS - (student.hours || 0)}h to pass)
                  </span>
                )}
              </div>
              <p className="text-gray-400 mt-1 font-mono">
                Registration No: <span className="text-white font-semibold">{student.registrationNumber}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-right">
                <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Total Approved Hours</p>
                <p className="text-3xl font-black text-white">{student.hours || 0} <span className="text-sm font-semibold text-gray-400">/ {TOTAL_WORK_HOURS}h</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <FileTextIcon className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Progress bar towards 90 hours */}
          <div className="mb-8 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2">
              <span>Goal Progress (100% at {TOTAL_WORK_HOURS} Hours)</span>
              <span className="text-white font-bold">{progressPct}% ({student.hours || 0}h logged)</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPassed
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
                }`}
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Contact Information
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-white">{student.email || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Mobile:</span>
                  <span className="font-medium text-white">{student.mobile || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Registration Number:</span>
                  <span className="font-medium text-white font-mono">{student.registrationNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                FFCS Evaluation Criteria
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Pass Threshold:</span>
                  <span className="font-semibold text-white">{PASS_HOURS} Hours</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">100% Target:</span>
                  <span className="font-semibold text-white">{TOTAL_WORK_HOURS} Hours</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500">Academic Status:</span>
                  <span className={`font-bold ${isPassed ? "text-green-400" : "text-amber-400"}`}>
                    {isPassed ? "PASSED (Eligible)" : `FAIL / IN PROGRESS (-${PASS_HOURS - (student.hours || 0)}h)`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Work History Table */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                Work History & Submissions ({hourRequests.length})
              </h3>
            </div>

            <div className="space-y-4">
              {hourRequests && hourRequests.length > 0 ? (
                <WorkHistoryTable data={hourRequests} />
              ) : (
                <p className="text-gray-500 text-sm text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No work history found for this student.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentViewPage;

