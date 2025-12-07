import { LockIcon } from "lucide-react";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  password,
  setPassword,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  password: string;
  setPassword: (password: string) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#1e1e1e] rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up border border-white/10 text-white">
        <h3 className="text-lg font-bold text-white">Confirm Action</h3>
        <p className="text-sm text-gray-400 mt-2">
          Uploading a new roster will{" "}
          <strong className="text-red-500">
            delete all current student data
          </strong>{" "}
          after generating a comprehensive report.
        </p>
        <p className="text-sm text-gray-400 mt-1 font-semibold">
          This action is irreversible.
        </p>

        <div className="mt-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Please enter your password to confirm.
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 text-white placeholder-gray-500 transition-colors"
            placeholder="Password"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
            }}
            className="px-4 py-2 bg-white/5 text-gray-300 text-sm font-semibold rounded-md hover:bg-white/10 transition-colors border border-white/5"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-semibold rounded-md hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-[#1e1e1e]"
          >
            <LockIcon className="w-4 h-4" />
            Confirm & Upload
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
