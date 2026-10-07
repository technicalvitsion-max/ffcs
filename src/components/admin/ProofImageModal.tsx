import { X, ExternalLinkIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";

export const ProofImageModal = ({
  isOpen,
  onClose,
  imageUrl,
}: {
  isOpen: boolean;
  onClose: React.MouseEventHandler;
  imageUrl: string | null;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `proof_work_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#121212] rounded-2xl shadow-2xl p-6 w-full max-w-3xl border border-white/10 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Proof of Work</h3>
            <p className="text-xs text-gray-400 mt-0.5">Submitted verification photograph</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              title="Download Image"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open full size in new tab"
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <ExternalLinkIcon className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] min-h-[220px] overflow-auto flex items-center justify-center bg-black/50 rounded-xl border border-white/5 p-2">
          {hasError ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-amber-400 font-semibold text-sm">Preview could not be rendered directly.</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                Open original photo link
              </a>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Proof of Work"
              onError={() => setHasError(true)}
              className="max-w-full max-h-[70vh] rounded-lg object-contain shadow-md"
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            {imageUrl.startsWith("data:") ? "High-res embedded image" : "Cloud verification asset"}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

