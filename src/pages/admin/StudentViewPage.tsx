import { StaticLoader } from "@/components/common/Loader";
import WorkHistoryTable from "@/components/student/WorkHistoryTable";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import type { HourRequest, Student } from "@/lib/types";
import { RequestsService } from "@/services/requests";
import { StudentsService } from "@/services/students";
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

function StudentViewPage() {
  const { id } = useParams();
  const { error, setError } = useError() as ErrorContextType;
  const [student, setStudent] = useState<Student | undefined>();
  const [hourRequests, setHourRequests] = useState<HourRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // setLoading(true);

    StudentsService.getStudentByRegistrationNumber(id as string)
      .then((data) => setStudent(data || undefined))
      .catch((err) => setError(err));

    RequestsService.getHourRequestsByRegistrationNumber(id as string)
      .then(setHourRequests)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id, setError]);

  if (error) return <Navigate to={"/error"} replace />;
  if (loading || student == null) return <StaticLoader isVisible />;

  // if (!loading && student == null) {
  //   return (
  //     <div className="text-center p-5 text-gray-900 font-semibold bg-white rounded-xl shadow-inner">
  //       Invalid registration number
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]">
      <div className="bg-[#121212] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10">
        <div className="border-b border-white/5 pb-6 mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">{student!.name}</h2>
          <p className="text-gray-400 mt-1">
            Registration No: {student!.registrationNumber}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              Contact Information
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center gap-3">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                {student!.email}
              </p>
              <p className="flex items-center gap-3">
                <span className="w-1 h-1 bg-white rounded-full"></span>
                {student!.mobile}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
              Club Contribution
            </h3>
            <div className="text-gray-300">
              <p className="flex items-center gap-2">
                Total Approved Hours:
                <span className="text-3xl font-black text-white pl-2">
                  {student!.hours}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
            Work History
          </h3>

          <div className="space-y-4">
            {hourRequests && hourRequests.length > 0 ? (
              <WorkHistoryTable data={hourRequests} />
            ) : (
              <p className="text-gray-500 text-sm text-center py-6 bg-white/5 rounded-2xl border border-dashed border-white/10">
                No work history found for this student.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentViewPage;
