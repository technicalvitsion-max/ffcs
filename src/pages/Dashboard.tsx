import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { Role } from "@/lib/types";
import AdminDashboardLayout from "./admin/AdminDashboardLayout";
import StudentDashboard from "./student/StudentDashboardPage";

function Dashboard() {
  const { user } = useAuth() as AuthContextType;
  if (user?.role === Role.ADMIN) {
    return <AdminDashboardLayout />;
  }
  return <StudentDashboard />;
}

export default Dashboard;
