// app/admin/roster/page.tsx (Server Component)
import StudentTable from "@/components/admin/StudentsTable";
import { StaticLoader } from "@/components/common/Loader";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import type { Student } from "@/lib/types";
import { StudentsService } from "@/services/students";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function StudentsViewPage() {
  const [students, setStudents] = useState<Partial<Student>[]>([]);
  const { error, setError } = useError() as ErrorContextType;
  useEffect(() => {
    StudentsService.getAllStudents()
      .then((data) => setStudents(data))
      .catch((err) => setError(err));
  }, [setError]);

  if (error) return <Navigate to={"/error"} replace />;

  if (students.length === 0) return <StaticLoader isVisible />;

  return (
    <>
      <StudentTable students={students} />
    </>
  );
}
