import { useState, useEffect, useRef } from "react";
import { ClockIcon, XIcon, CheckIcon, ImageIcon, UploadIcon, Trash2Icon, RotateCcwIcon } from "lucide-react";

type EditRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hours: number, newFile?: File | null, removeProof?: boolean) => void;
  initialHours: number;
  initialProofUrl?: string | null;
  title?: string;
  isApproving?: boolean;
};

export const EditRequestModal = ({
  isOpen,
  onClose,
  onConfirm,
  initialHours,
  initialProofUrl = null,
  title = "Edit Request",
  isApproving = false,
}: EditRequestModalProps) => {
  const [hours, setHours] = useState(initialHours);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeProof, setRemoveProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setHours(initialHours);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveProof(false);
  }, [initialHours, initialProofUrl, isOpen]);

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

  const handleSubmit = () => {
    onConfirm(hours, selectedFile, removeProof);
  };

  const activeProof = previewUrl || (!removeProof ? initialProofUrl : null);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="bg-[#161616] rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          {isApproving
            ? "Verify or modify the approved hours and proof photo before confirming."
            : "Update credited hours or change the submitted proof image."}
          <span className="text-gray-500 mt-1 block font-mono">
            Hours credited directly affect the student's total balance.
          </span>
        </p>

        {/* Hours input */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Hours Credited
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white font-bold text-sm"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        {/* Proof Image Section */}
        <div className="mb-6 bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              Proof Photograph
            </label>
            {selectedFile && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                New Photo Ready (~30KB)
              </span>
            )}
            {removeProof && (
              <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold">
                Will Be Removed
              </span>
            )}
          </div>

          {/* Current / New Image Preview */}
          {activeProof ? (
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/50 aspect-video max-h-36 flex items-center justify-center group">
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
            <div className="text-center py-4 px-3 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
              {removeProof ? (
                <div className="space-y-2">
                  <p className="text-xs text-red-400 font-medium">Proof image will be removed on save</p>
                  <button
                    type="button"
                    onClick={handleRestoreProof}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-semibold cursor-pointer underline"
                  >
                    <RotateCcwIcon className="w-3 h-3" /> Restore original proof
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
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

          {/* Change button if image is displayed */}
          {activeProof && (
            <div className="flex items-center justify-between text-xs pt-1">
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

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 text-gray-300 text-xs font-semibold rounded-xl hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isApproving
                ? "bg-white text-black hover:bg-gray-200 shadow-md"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
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
    </div>
  );
};
