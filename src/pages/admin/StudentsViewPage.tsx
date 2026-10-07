import StudentTable from "@/components/admin/StudentsTable";
import { StaticLoader } from "@/components/common/Loader";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import { useAdminView, type AdminViewContextType } from "@/context/AdminViewContext";
import type { Student } from "@/lib/types";
import { StudentsService } from "@/services/students";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UsersIcon, UploadIcon } from "lucide-react";

export default function StudentsViewPage() {
  const [students, setStudents] = useState<Partial<Student>[]>([]);
  const [loading, setLoading] = useState(true);
  const { error, setError } = useError() as ErrorContextType;
  const { setView } = useAdminView() as AdminViewContextType;

  useEffect(() => {
    StudentsService.getAllStudents()
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setError]);

  if (error) return <Navigate to={"/error"} replace />;

  if (loading) return <StaticLoader isVisible />;

  if (students.length === 0) {
    return (
      <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]">
        <div className="bg-[#121212] p-10 rounded-[2.5rem] shadow-2xl border border-white/10 text-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Students In Database</h3>
          <p className="text-sm text-gray-400 mb-6">
            The student roster is currently empty. Upload your CSV roster to populate students and start tracking hours.
          </p>
          <button
            onClick={() => setView("roster")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <UploadIcon className="w-4 h-4" />
            Go to Student Roster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]">
      <StudentTable students={students} />
    </div>
  );
}
