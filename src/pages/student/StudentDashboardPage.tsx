import Navbar from "@/components/common/Navbar";
import StudentsPageContent from "@/components/student/StudentDashboardContent";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import { TOTAL_WORK_HOURS } from "@/lib/constants";
import { type HourRequest } from "@/lib/types";
import { RequestsService } from "@/services/requests";
import { StudentsService } from "@/services/students";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function StudentsDashboard() {
  const [completedHours, setCompletedHours] = useState(0);
  const [hourRequests, setHourRequests] = useState<HourRequest[]>([]);

  const { user } = useAuth() as AuthContextType;
  const { error, setError } = useError() as ErrorContextType;

  useEffect(() => {
    StudentsService.getTotalHours(user!)
      .then(setCompletedHours)
      .catch(setError);

    RequestsService.getHourRequests(user!)
      .then(setHourRequests)
      .catch(setError);
  }, [user, setError]);

  if (error) return <Navigate to={"/error"} replace />;

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <StudentsPageContent
          hourRequests={hourRequests}
          totalHours={completedHours}
          remainingHours={TOTAL_WORK_HOURS - completedHours}
          progressPercentage={Math.min(
            100,
            (completedHours / TOTAL_WORK_HOURS) * 100
          )}
        />
      </div>
    </>
  );
}

export default StudentsDashboard;
