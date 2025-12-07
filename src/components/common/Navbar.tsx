import {
  useAlert,
  type AlertContextType,
} from "@/context/AlertContext";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { formatName } from "@/lib/formatName";
import { AlertType, Role, type User } from "@/lib/types";
import { AuthService } from "@/services/auth";
import { UserIcon, LogOutIcon, LayoutDashboardIcon, KeyIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const { user } = useAuth() as AuthContextType;
  const { showAlert } = useAlert() as AlertContextType;
  const { setLoading } = useLoader() as LoaderContextType;

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setLoading(true, "Please wait");
    try {
      const res = await AuthService.triggerChangePassword(
        user as Partial<User>
      );
      setLoading(false);
      showAlert(res as string, AlertType.SUCCESS, 5000);
      setTimeout(async () => {
        await AuthService.logout();
      }, 5500);
    } catch (error) {
      showAlert(error as string);
    }
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  return (
    <nav className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl transition-all duration-300">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/vitsion-logo.png" alt="VITSION" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-screen" />
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-gray-300 transition-colors">
              VITSION FFCS
            </span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full bg-white/10 border border-white/5 hover:bg-white/20 transition-all duration-300 group"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold">
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white hidden sm:block">
                {user ? "Account" : "Menu"}
              </span>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 z-20 mt-3 w-64 origin-top-right rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none border border-slate-100"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-slate-100 mb-2">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {formatName(user.name)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigate("/dashboard");
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <LayoutDashboardIcon className="w-4 h-4" />
                          Dashboard
                        </button>
                        {user.role === Role.STUDENT && (
                          <button
                            onClick={handleResetPassword}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                          >
                            <KeyIcon className="w-4 h-4" />
                            Change password
                          </button>
                        )}
                        <div className="h-px bg-slate-100 my-2"></div>
                        <button
                          onClick={async () => {
                            await AuthService.logout();
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOutIcon className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            navigate("/login");
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          Login
                        </button>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
