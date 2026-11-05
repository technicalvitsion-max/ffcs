import { useState } from "react";
import RequestsList from "../../components/admin/RequestsList";
import { ProofImageModal } from "../../components/admin/ProofImageModal";
import { useAlert, type AlertContextType } from "@/context/AlertContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { RequestsService } from "@/services/requests";
import { AlertType, type HourRequest } from "@/lib/types";
import { motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";

function RequestsComponent({ requests: allRequests, onRefresh }: { requests: HourRequest[]; onRefresh: () => void }) {
  const { showAlert } = useAlert() as AlertContextType;
  const { setLoading } = useLoader() as LoaderContextType;
  const [activeTab, setActiveTab] = useState("pending");
  const [isProofModalOpen, setisProofModalOpen] = useState(false);
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimizeProofs = async () => {
    if (
      !window.confirm(
        "This will scan all stored requests in Cloud Firestore and compress any large legacy proof images down to ~30KB to save database bandwidth and storage.\n\nProceed?"
      )
    ) {
      return;
    }

    setIsOptimizing(true);
    setLoading(true, "Scanning and compressing old proof images...");
    try {
      const res = await RequestsService.compressOldRequestsProofs();
      if (res.totalCompressed > 0) {
        showAlert(
          `Optimized ${res.totalCompressed} images! Saved ~${res.kbSaved} KB of Firestore storage.`,
          AlertType.SUCCESS
        );
      } else {
        showAlert("All images in the database are already compact and optimized!", AlertType.SUCCESS);
      }
      onRefresh();
    } catch (err) {
      showAlert(typeof err === "string" ? err : "Failed to optimize proofs", AlertType.DANGER);
    } finally {
      setIsOptimizing(false);
      setLoading(false);
    }
  };

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;
  const approvedCount = allRequests.filter((r) => r.status === "approved").length;
  const rejectedCount = allRequests.filter((r) => r.status === "rejected").length;

  const tabs = [
    { id: "pending", label: "Pending Requests", count: pendingCount, highlight: pendingCount > 0 },
    { id: "approved", label: "Approved History", count: approvedCount, highlight: false },
    { id: "rejected", label: "Rejected Requests", count: rejectedCount, highlight: false },
  ];

  return (
    <>
      <ProofImageModal
        imageUrl={selectedProofImage}
        isOpen={isProofModalOpen}
        onClose={() => {
          setisProofModalOpen(false);
          setSelectedProofImage(null);
        }}
      />
      <div className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]">
        <div className="bg-[#121212] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Manage Hour Requests
              </h2>
              <p className="text-gray-400 mt-1">
                Review submissions, verify proof files, and manage approval status
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={handleOptimizeProofs}
                disabled={isOptimizing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title="Compress legacy proof photos stored in Firestore down to ~30KB"
              >
                <SparklesIcon className="w-4 h-4 text-amber-400" />
                {isOptimizing ? "Compressing Images..." : "Optimize DB Images"}
              </button>
            </div>
          </div>

          {/* Tabs with live count badges */}
          <div className="bg-[#0a0a0a] p-1.5 rounded-2xl inline-flex flex-wrap border border-white/10 shadow-inner mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeRequestTab"
                    className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={`relative z-10 px-2 py-0.5 rounded-full text-[11px] font-mono ${
                    tab.highlight
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content based on tab */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden"
          >
            <RequestsList
              status={activeTab}
              requests={allRequests}
              setSelectedProofImage={setSelectedProofImage}
              setisProofModalOpen={setisProofModalOpen}
              onActionComplete={onRefresh}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default RequestsComponent;
