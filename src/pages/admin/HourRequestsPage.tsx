import { useState, useEffect } from "react";
import RequestsList from "../../components/admin/RequestsList";
import { ProofImageModal } from "../../components/admin/ProofImageModal";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { RequestsService } from "@/services/requests";
import type { HourRequest } from "@/lib/types";
import { motion } from "framer-motion";

function RequestsComponent() {
  const { user } = useAuth() as AuthContextType;
  const [activeTab, setActiveTab] = useState("pending");
  const [isProofModalOpen, setisProofModalOpen] = useState(false);
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  const [allRequests, setAllRequests] = useState<HourRequest[]>([]);

  useEffect(() => {
    if (user) {
      RequestsService.getHourRequests(user)
        .then(setAllRequests)
        .catch(() => {});
    }
  }, [user]);

  const refreshCounts = () => {
    if (user) {
      RequestsService.getHourRequests(user)
        .then(setAllRequests)
        .catch(() => {});
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
              setSelectedProofImage={setSelectedProofImage}
              setisProofModalOpen={setisProofModalOpen}
              onActionComplete={refreshCounts}
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default RequestsComponent;
