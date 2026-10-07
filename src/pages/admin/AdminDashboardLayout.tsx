import { useState, useEffect } from "react";
import {
  LayoutDashboardIcon,
  ClockIcon,
  FileSpreadsheetIcon,
  LogOutIcon,
  MenuIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import AdminOverviewPage from "./AdminOverviewPage";
import HourRequestsPage from "./HourRequestsPage";
import StudentsViewPage from "./StudentsViewPage";
import StudentsRosterPage from "./StudentRosterPage";
import {
  useAdminView,
  type AdminViewContextType,
} from "@/context/AdminViewContext";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { AuthService } from "@/services/auth";
import { RequestsService } from "@/services/requests";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function AdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { view, setView } = useAdminView() as AdminViewContextType;
  const { user } = useAuth() as AuthContextType;
  const { setLoading } = useLoader() as LoaderContextType;
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Load pending request badge
  useEffect(() => {
    if (user) {
      RequestsService.getHourRequests(user)
        .then((reqs) => {
          const pending = reqs.filter((r) => r.status === "pending").length;
          setPendingCount(pending);
        })
        .catch(() => {});
    }
  }, [user, view]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleNavClick = (newView: string) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboardIcon,
      badge: null,
    },
    {
      id: "requests",
      label: "Hour Requests",
      icon: ClockIcon,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: "students",
      label: "Student Directory",
      icon: UsersIcon,
      badge: null,
    },
    {
      id: "roster",
      label: "Student Roster",
      icon: FileSpreadsheetIcon,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white flex">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 w-full bg-[#121212]/90 backdrop-blur-md z-40 border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
            <img
              src="/vitsion-logo.png"
              alt="VITSION"
              className="w-8 h-8 object-contain mix-blend-screen"
            />
          </div>
          <h1 className="text-lg font-bold text-white">VITSION Admin</h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          ></motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="fixed top-0 left-0 h-full w-72 bg-[#121212] border-r border-white/10 z-50 flex flex-col justify-between shadow-2xl lg:shadow-none lg:sticky lg:h-screen lg:translate-x-0"
        initial={false}
        animate={{ x: isDesktop ? 0 : isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-2 rounded-xl shadow-lg border border-white/5">
                <img
                  src="/vitsion-logo.png"
                  alt="VITSION"
                  className="w-8 h-8 object-contain mix-blend-screen"
                />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  VITSION
                </h1>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex items-center justify-between w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  view === item.id
                    ? "bg-white text-black shadow-md"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      view === item.id
                        ? "text-black"
                        : "text-gray-500 group-hover:text-gray-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                      view === item.id
                        ? "bg-black text-white"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-6 border-t border-white/5">
          <div className="mb-4 px-2">
            <p className="text-xs font-bold text-white truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {user?.email || "admin@vitsion.com"}
            </p>
          </div>

          <button
            onClick={async (e) => {
              e.preventDefault();
              setLoading(true, "Logging out");
              await AuthService.logout();
              navigate("/");
              setLoading(false);
            }}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-gray-400 hover:bg-red-500/10 hover:text-red-500 group"
          >
            <LogOutIcon className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content View Container */}
      <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {view === "overview" && <AdminOverviewPage />}
              {view === "requests" && <HourRequestsPage />}
              {view === "students" && <StudentsViewPage />}
              {view === "roster" && <StudentsRosterPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardLayout;
