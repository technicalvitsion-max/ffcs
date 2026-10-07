import {
  useAlert,
  type AlertContextType,
} from "@/context/AlertContext";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { AlertType, type HourRequest } from "@/lib/types";
import { RequestsService } from "@/services/requests";
import { ImageIcon, CheckIcon, XIcon, ClockIcon, CalendarIcon, PencilIcon, TrashIcon, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EditRequestModal } from "./EditRequestModal";

function RequestsList({
  status,
  setSelectedProofImage,
  setisProofModalOpen,
  onActionComplete,
}: {
  status: string;
  setSelectedProofImage: (url: string) => void;
  setisProofModalOpen: (isOpen: boolean) => void;
  onActionComplete?: () => void;
}) {
  const { user } = useAuth() as AuthContextType;
  const { error, setError } = useError() as ErrorContextType;
  const { setLoading } = useLoader() as LoaderContextType;
  const { showAlert } = useAlert() as AlertContextType;
  const [requests, setRequests] = useState<HourRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // State for Edit/Approve Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HourRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    RequestsService.getHourRequests(user!).then(setRequests).catch(setError);
  }, [user, setError]);

  if (error) return <Navigate to={"/error"} />;

  const filteredRequests = requests.filter((req) => {
    if (req.status !== status) return false;
    if (!searchQuery.trim()) return true;
    const lower = searchQuery.toLowerCase();
    return (
      (req.name && req.name.toLowerCase().includes(lower)) ||
      (req.registrationNumber && req.registrationNumber.toLowerCase().includes(lower)) ||
      (req.workName && req.workName.toLowerCase().includes(lower))
    );
  });

  const refreshRequests = () => {
    RequestsService.getHourRequests(user!)
      .then((data) => {
        setRequests(data);
        onActionComplete?.();
      })
      .catch(setError);
  };

  const handleApproveClick = (request: HourRequest) => {
    setSelectedRequest(request);
    setIsApproving(true);
    setIsEditModalOpen(true);
  };

  const handleEditClick = (request: HourRequest) => {
    setSelectedRequest(request);
    setIsApproving(false);
    setIsEditModalOpen(true);
  };

  const handleModalConfirm = async (hours: number) => {
    if (!selectedRequest) return;
    setIsEditModalOpen(false);

    if (isApproving) {
      // Approving with potentially modified hours
      setLoading(true, "Approving request...");
      try {
        await RequestsService.handleRequestAction(selectedRequest.id, "approved", hours);
        showAlert("Request approved", AlertType.SUCCESS);
        refreshRequests();
      } catch (err) {
        setError(err as string);
      }
      setLoading(false);
    } else {
      // Editing an already approved request
      setLoading(true, "Updating hours...");
      try {
        await RequestsService.updateApprovedRequest(selectedRequest.id, hours);
        showAlert("Request updated", AlertType.SUCCESS);
        refreshRequests();
      } catch (err) {
        setError(err as string);
      }
      setLoading(false);
    }
    setSelectedRequest(null);
  };

  const handleDelete = async (request: HourRequest) => {
    if (!window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) return;

    setLoading(true, "Deleting request...");
    try {
      await RequestsService.deleteRequest(request.id);
      showAlert("Request deleted", AlertType.SUCCESS);
      refreshRequests();
    } catch (err) {
      setError(err as string);
    }
    setLoading(false);
  };

  const handleReject = async (requestId: string) => {
    setLoading(true, "Rejecting request...");
    try {
      await RequestsService.handleRequestAction(requestId, "rejected");
      showAlert("Request rejected", AlertType.DANGER);
      refreshRequests();
    } catch (err) {
      setError(err as string);
    }
    setLoading(false);
  };

  if (filteredRequests.length === 0) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/5 rounded-full shadow-sm">
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <p className="text-lg font-medium text-white">No requests found</p>
          <p className="text-sm text-gray-400">
            There are no {status} requests at the moment.
          </p>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {requests.filter((r) => r.status === status).length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={`Filter ${status} by name, ID or work...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-white placeholder-gray-500 transition-all"
            />
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">
            Showing {filteredRequests.length} requests
          </span>
        </div>
      )}

      <div className="divide-y divide-white/5 bg-[#0a0a0a]/50 rounded-[2rem] border border-white/5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((request) => {
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={request.id}
                className="p-8 hover:bg-white/5 transition-colors group first:rounded-t-[2rem] last:rounded-b-[2rem]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {request.name}
                          <span className="text-gray-600 font-normal text-sm">|</span>
                          <span className="text-gray-400 font-medium text-base">{request.registrationNumber}</span>
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${request.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : request.status === "approved"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}>
                            {request.hours} Hours
                          </span>
                          <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full border border-white/5">
                            {request.workSlab}
                          </span>
                          <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full border border-white/5">
                            {request.workType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
                      <p className="font-semibold text-gray-300 text-sm mb-1">
                        {request.workName}
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {request.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Work Date: {request.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5" />
                        Submitted: {request.submitted}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const proofUrl = typeof request.proof === "string" ? request.proof : request.proof?.url || (request as any)?.proofUrl || null;

                    return (
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 min-w-[140px]">
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => {
                                if (proofUrl) {
                                  setSelectedProofImage(proofUrl);
                                  setisProofModalOpen(true);
                                }
                              }}
                              className={`flex items-center justify-center gap-2 w-full px-5 py-2.5 text-sm font-bold rounded-full transition-all shadow-sm ${
                                proofUrl
                                  ? "bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 cursor-pointer"
                                  : "bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={!proofUrl}
                            >
                              {proofUrl ? (
                                <>
                                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                                  View Proof
                                </>
                              ) : (
                                "No Proof"
                              )}
                            </button>

                            <div className="flex items-center gap-2 w-full">
                              <button
                                onClick={() => handleReject(request.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-full hover:bg-red-500/20 transition-all shadow-sm"
                                title="Reject"
                              >
                                <XIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleApproveClick(request)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all shadow-sm"
                                title="Approve / Modify"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}

                        {request.status === "approved" && (
                          <div className="flex flex-col items-end gap-3 w-full">
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-full flex items-center gap-1.5 border border-green-500/20">
                                <CheckIcon className="w-3 h-3" />
                                APPROVED
                              </span>
                              {request.approved && (
                                <span className="text-xs text-gray-500">on {request.approved}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {proofUrl && (
                                <button
                                  onClick={() => {
                                    setSelectedProofImage(proofUrl);
                                    setisProofModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                  title="View Submitted Proof"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditClick(request)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                title="Edit Hours"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(request)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                title="Delete Request"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {request.status === "rejected" && (
                          <div className="flex flex-col items-end gap-3 w-full">
                            <div className="flex flex-col items-end gap-1">
                              <span className="px-4 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-full flex items-center gap-1.5 border border-red-500/20">
                                <XIcon className="w-3 h-3" />
                                REJECTED
                              </span>
                              {request.rejected && (
                                <span className="text-xs text-gray-500">on {request.rejected}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {proofUrl && (
                                <button
                                  onClick={() => {
                                    setSelectedProofImage(proofUrl);
                                    setisProofModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                  title="View Submitted Proof"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(request)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                title="Delete Request"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <EditRequestModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleModalConfirm}
        initialHours={selectedRequest?.hours || 0}
        title={isApproving ? "Approve Request" : "Edit Request Hours"}
        isApproving={isApproving}
      />
    </>
  );
}

export default RequestsList;
