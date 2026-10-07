import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MailIcon, KeyRoundIcon, XIcon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { AuthService } from "@/services/auth";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const message = await AuthService.sendForgotPasswordEmail(identifier);
      setSuccessMessage(message);
      setIdentifier("");
    } catch (err: unknown) {
      setErrorMessage(typeof err === "string" ? err : "Failed to send reset link. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIdentifier("");
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-[#121212] border border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-md w-full relative z-10 shadow-2xl text-white"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XIcon className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl mx-auto flex items-center justify-center text-white mb-4">
                <KeyRoundIcon className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Reset Password
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Enter your Registration Number or VIT email address and we'll send you a password reset link.
              </p>
            </div>

            {/* Success State */}
            {successMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-emerald-300 text-xs sm:text-sm leading-relaxed flex items-start gap-3 text-left">
                  <CheckCircle2Icon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 bg-white hover:bg-gray-200 text-black font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircleIcon className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Reg. Number or Email
                  </label>
                  <div className="relative">
                    <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="e.g. 24BCE1121 or name@vitstudent.ac.in"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !identifier.trim()}
                  className="w-full py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>Sending reset email...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
