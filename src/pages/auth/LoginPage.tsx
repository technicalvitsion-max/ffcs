import { useAlert, type AlertContextType } from "@/context/AlertContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { AuthService } from "@/services/auth";
import { LockIcon, LogInIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const { setLoading, isLoading } = useLoader() as LoaderContextType;
  const { showAlert } = useAlert() as AlertContextType;

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true, "Logging in");
    try {
      await AuthService.login(registrationNumber, password);
    } catch (error) {
      showAlert(error as string);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#121212] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8 inline-block"
          >
            <img src="/vitsion-logo.png" alt="VITSION" className="h-20 w-auto object-contain mix-blend-screen" />
          </motion.div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Access the Vitsion Portal
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text" // Changed from email to text as per original logic
                placeholder="Registration Number / Email"
                value={registrationNumber} // Changed from email to registrationNumber
                onChange={(e) => setRegistrationNumber(e.target.value)} // Changed from setEmail to setRegistrationNumber
                className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white text-white placeholder-gray-600 outline-none transition-all"
                required
              />
            </div>

            <div className="relative">
              <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white text-white placeholder-gray-600 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 transform active:scale-95"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <LogInIcon className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          © {new Date().getFullYear()} VITSION Club. Internal Access Only.
        </p>
      </motion.div>
    </div >
  );
};

export default LoginPage;
