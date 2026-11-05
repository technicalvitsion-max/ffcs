import { useState, useRef } from "react";
import type { RequestStatus } from "@/lib/types";
import {
  ClockIcon,
  XIcon,
  CheckIcon,
  ImageIcon,
  UploadIcon,
  Trash2Icon,
  RotateCcwIcon,
  CalendarIcon,
  MessageSquareIcon,
  AlertCircleIcon,
} from "lucide-react";

export type EditRequestConfirmPayload = {
  hours: number;
  status: RequestStatus;
  date: string;
  remark: string;
  newFile?: File | null;
  removeProof?: boolean;
};

type EditRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: EditRequestConfirmPayload) => void;
  initialHours: number;
  initialStatus?: RequestStatus;
  initialDate?: string;
  initialRemark?: string;
  initialProofUrl?: string | null;
  title?: string;
  isApproving?: boolean;
};

export const EditRequestModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialHours,
  initialStatus = "pending",
  initialDate = "",
  initialRemark = "",
  initialProofUrl = null,
  title = "Edit Request",
  isApproving = false,
}: EditRequestModalProps) => {
  const [hours, setHours] = useState(initialHours);
  const [status, setStatus] = useState<RequestStatus>(
    isApproving ? "approved" : initialStatus
  );
  const [date, setDate] = useState(initialDate);
  const [remark, setRemark] = useState(initialRemark);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeProof, setRemoveProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }
      setSelectedFile(file);
      setRemoveProof(false);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMarkRemoveProof = () => {
    handleRemoveFile();
    setRemoveProof(true);
  };

  const handleRestoreProof = () => {
    setRemoveProof(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      hours: Number(hours),
      status,
      date,
      remark,
      newFile: selectedFile,
      removeProof,
    });
  };

  const activeProof = previewUrl || (!removeProof ? initialProofUrl : null);

  // Calculate balance change impact for admin transparency
  let balanceImpactText: string | null = null;
  if (initialStatus === "approved" && status !== "approved") {
    balanceImpactText = `Will deduct ${initialHours} hrs from student's total balance.`;
  } else if (initialStatus !== "approved" && status === "approved") {
    balanceImpactText = `Will credit ${hours} hrs to student's total balance.`;
  } else if (initialStatus === "approved" && status === "approved" && Number(hours) !== initialHours) {
    const diff = Number(hours) - initialHours;
    balanceImpactText = `Will adjust student balance by ${diff > 0 ? "+" : ""}${diff} hrs.`;
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-[#141414] rounded-[2rem] shadow-2xl p-6 sm:p-7 w-full max-w-lg animate-fade-in-up border border-white/10 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Modify status, hours, work date, remarks, or proof
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selection Pills */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Request Status
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#0a0a0a] rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setStatus("pending")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Pending
              </button>

              <button
                type="button"
                onClick={() => setStatus("approved")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === "approved"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Approved
              </button>

              <button
                type="button"
                onClick={() => setStatus("rejected")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  status === "rejected"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Rejected
              </button>
            </div>

            {/* Impact feedback */}
            {balanceImpactText && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{balanceImpactText}</span>
              </div>
            )}
          </div>

          {/* Hours & Date in a 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Hours Credited
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white font-bold text-xs"
                  min="0"
                  step="0.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Work Date
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white text-xs font-medium cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Admin Remark / Note */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquareIcon className="w-3.5 h-3.5 text-amber-400" />
              Admin Remark (Optional)
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Verified with event head, partial 2.5h approved, missing clear selfie..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white text-xs placeholder-gray-500 resize-none transition-all"
            />
          </div>

          {/* Proof Image Box */}
          <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                Proof Photograph
              </label>
              {selectedFile && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  New Image Ready (~30KB)
                </span>
              )}
              {removeProof && (
                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold">
                  Will Be Removed
                </span>
              )}
            </div>

            {activeProof ? (
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 aspect-video max-h-32 flex items-center justify-center group">
                <img
                  src={activeProof}
                  alt="Proof preview"
                  className="max-h-full max-w-full object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={selectedFile ? handleRemoveFile : handleMarkRemoveProof}
                    className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-lg backdrop-blur-md transition-colors cursor-pointer"
                    title="Remove proof"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-3.5 px-3 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                {removeProof ? (
                  <div className="space-y-1.5">
                    <p className="text-xs text-red-400 font-medium">Proof photo will be cleared</p>
                    <button
                      type="button"
                      onClick={handleRestoreProof}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-semibold cursor-pointer underline"
                    >
                      <RotateCcwIcon className="w-3 h-3" /> Restore original proof
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xs text-gray-500">No proof photograph attached</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <UploadIcon className="w-3.5 h-3.5 text-gray-300" /> Upload Proof Photo
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeProof && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer underline text-[11px]"
                >
                  Upload different photo
                </button>
                {!selectedFile && !removeProof && (
                  <button
                    type="button"
                    onClick={handleMarkRemoveProof}
                    className="text-red-400/70 hover:text-red-400 transition-colors cursor-pointer text-[11px]"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 text-gray-300 text-xs font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                status === "approved"
                  ? "bg-white text-black hover:bg-gray-200 shadow-md"
                  : status === "rejected"
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20"
                    : "bg-yellow-500 text-black hover:bg-yellow-400 shadow-md shadow-yellow-500/20"
              }`}
            >
              <CheckIcon className="w-4 h-4" />
              {status === "approved"
                ? "Confirm & Approve"
                : status === "rejected"
                  ? "Save as Rejected"
                  : "Save as Pending"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
