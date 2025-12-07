import { useState, useEffect } from "react";
import { ClockIcon, XIcon, CheckIcon } from "lucide-react";

type EditRequestModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (hours: number) => void;
    initialHours: number;
    title?: string;
    isApproving?: boolean;
};

export const EditRequestModal = ({
    isOpen,
    onClose,
    onConfirm,
    initialHours,
    title = "Edit Request Hours",
    isApproving = false,
}: EditRequestModalProps) => {
    const [hours, setHours] = useState(initialHours);

    useEffect(() => {
        setHours(initialHours);
    }, [initialHours, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
                className="bg-[#1e1e1e] rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-400 mb-6">
                    {isApproving
                        ? "You can modify the approved hours before confirming."
                        : "Update the credited hours for this request."}
                    <br />
                    <span className="text-xs text-gray-500 mt-1 block">
                        This will automatically adjust the student's total balance.
                    </span>
                </p>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Hours Credited
                    </label>
                    <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white font-bold"
                            min="0"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/5 text-gray-300 text-sm font-semibold rounded-lg hover:bg-white/10 transition-colors border border-white/5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(hours)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${isApproving
                                ? "bg-white text-black hover:bg-gray-200"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                            }`}
                    >
                        {isApproving ? (
                            <>
                                <CheckIcon className="w-4 h-4" />
                                Approve & Credit
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
            <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
        </div>
    );
};
