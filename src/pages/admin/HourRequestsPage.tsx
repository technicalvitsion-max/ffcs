import { useState } from "react";
import RequestsList from "../../components/admin/RequestsList";
import { ProofImageModal } from "../../components/admin/ProofImageModal";
import { motion } from "framer-motion";

function RequestsComponent() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isProofModalOpen, setisProofModalOpen] = useState(false);
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  const tabs = [
    { id: "pending", label: "Pending Requests" },
    { id: "approved", label: "Approved History" },
    { id: "rejected", label: "Rejected Requests" },
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
                Review and manage student hour submissions
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#0a0a0a] p-1.5 rounded-xl inline-flex border border-white/10 shadow-inner mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeRequestTab"
                    className="absolute inset-0 bg-white/10 border border-white/5 rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
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
            />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default RequestsComponent;
