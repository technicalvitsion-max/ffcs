import { X } from "lucide-react";

export const ProofImageModal = ({
  isOpen,
  onClose,
  imageUrl,
}: {
  isOpen: boolean;
  onClose: React.MouseEventHandler;
  imageUrl: string | null;
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose} // Close on overlay click
    >
      <div
        className="bg-[#1e1e1e] rounded-xl shadow-2xl p-4 w-full max-w-2xl animate-fade-in-up border border-white/10"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <h3 className="text-lg font-bold text-white">Proof of Work</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt="Proof of Work"
            className="w-full h-auto rounded-lg object-contain"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 text-gray-300 text-sm font-semibold rounded-md hover:bg-white/10 transition-colors border border-white/5"
          >
            Close
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
