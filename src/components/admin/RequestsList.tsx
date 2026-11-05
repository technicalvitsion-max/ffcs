import {
  useAlert,
  type AlertContextType,
} from "@/context/AlertContext";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useError, type ErrorContextType } from "@/context/ErrorContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { AlertType, type HourRequest } from "@/lib/types";
import { RequestsService } from "@/services/requests";
import { ImageService } from "@/services/image";
import {
  ImageIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  LayersIcon,
  ArrowUpDownIcon,
  UserIcon,
  SlidersHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EditRequestModal } from "./EditRequestModal";

type SortOption =
  | "submittedDesc"
  | "submittedAsc"
  | "dateDesc"
  | "dateAsc"
  | "hoursDesc"
  | "hoursAsc"
  | "nameAsc"
  | "nameDesc"
  | "regAsc";

type GroupByOption = "none" | "student" | "workSlab" | "workType" | "date";

interface RequestGroup {
  key: string;
  title: string;
  subtitle?: string;
  items: HourRequest[];
  totalHours: number;
}

const parseDateMs = (d?: string) => {
  if (!d) return 0;
  const ms = new Date(d).getTime();
  return isNaN(ms) ? 0 : ms;
};

const formatGroupDate = (dateStr?: string) => {
  if (!dateStr || dateStr === "unknown") return "No Date Specified";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

function RequestCardItem({
  request,
  setSelectedProofImage,
  setisProofModalOpen,
  handleReject,
  handleApproveClick,
  handleEditClick,
  handleDelete,
}: {
  request: HourRequest;
  setSelectedProofImage: (url: string) => void;
  setisProofModalOpen: (isOpen: boolean) => void;
  handleReject: (id: string) => void;
  handleApproveClick: (req: HourRequest) => void;
  handleEditClick: (req: HourRequest) => void;
  handleDelete: (req: HourRequest) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proofUrl =
    typeof request.proof === "string"
      ? request.proof
      : request.proof?.url || (request as any)?.proofUrl || null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      key={request.id}
      className="p-6 sm:p-8 hover:bg-white/[0.04] transition-colors group"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                {request.name}
                <span className="text-gray-600 font-normal text-sm">|</span>
                <span className="text-gray-400 font-medium text-base font-mono">
                  {request.registrationNumber}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    request.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      : request.status === "approved"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                  }`}
                >
                  {request.hours} Hours
                </span>
                {request.workSlab && (
                  <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full border border-white/5">
                    {request.workSlab}
                  </span>
                )}
                {request.workType && (
                  <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full border border-white/5">
                    {request.workType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-2xl border border-white/5">
            <p className="font-semibold text-gray-300 text-sm mb-1">
              {request.workName}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Work Date: {request.date || "Not specified"}
            </div>
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5" />
              Submitted: {request.submitted || "Not specified"}
            </div>
          </div>
        </div>

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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold rounded-full hover:bg-red-500/20 transition-all shadow-sm cursor-pointer"
                  title="Reject"
                >
                  <XIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApproveClick(request)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-all shadow-sm cursor-pointer"
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
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    title="View Submitted Proof"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleEditClick(request)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Edit Hours"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(request)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
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
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                    title="View Submitted Proof"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleEditClick(request)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Edit Request & Proof"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(request)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                  title="Delete Request"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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

  // Group By and Sort States
  const [groupBy, setGroupBy] = useState<GroupByOption>("none");
  const [sortBy, setSortBy] = useState<SortOption>("submittedDesc");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // State for Edit/Approve Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HourRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    RequestsService.getHourRequests(user!).then(setRequests).catch(setError);
  }, [user, setError]);

  const totalRequestsInStatus = useMemo(() => {
    return requests.filter((r) => r.status === status).length;
  }, [requests, status]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (req.status !== status) return false;
      if (!searchQuery.trim()) return true;
      const lower = searchQuery.toLowerCase();
      return (
        (req.name && req.name.toLowerCase().includes(lower)) ||
        (req.registrationNumber && req.registrationNumber.toLowerCase().includes(lower)) ||
        (req.workName && req.workName.toLowerCase().includes(lower)) ||
        (req.workSlab && req.workSlab.toLowerCase().includes(lower)) ||
        (req.workType && req.workType.toLowerCase().includes(lower)) ||
        (req.date && req.date.toLowerCase().includes(lower))
      );
    });
  }, [requests, status, searchQuery]);

  const sortedRequests = useMemo(() => {
    const list = [...filteredRequests];
    list.sort((a, b) => {
      switch (sortBy) {
        case "submittedDesc": {
          const diff = parseDateMs(b.submitted) - parseDateMs(a.submitted);
          if (diff !== 0) return diff;
          return parseDateMs(b.date) - parseDateMs(a.date);
        }
        case "submittedAsc": {
          const diff = parseDateMs(a.submitted) - parseDateMs(b.submitted);
          if (diff !== 0) return diff;
          return parseDateMs(a.date) - parseDateMs(b.date);
        }
        case "dateDesc": {
          const diff = parseDateMs(b.date) - parseDateMs(a.date);
          if (diff !== 0) return diff;
          return parseDateMs(b.submitted) - parseDateMs(a.submitted);
        }
        case "dateAsc": {
          const diff = parseDateMs(a.date) - parseDateMs(b.date);
          if (diff !== 0) return diff;
          return parseDateMs(a.submitted) - parseDateMs(b.submitted);
        }
        case "hoursDesc": {
          const diff = (b.hours || 0) - (a.hours || 0);
          if (diff !== 0) return diff;
          return (a.name || "").localeCompare(b.name || "");
        }
        case "hoursAsc": {
          const diff = (a.hours || 0) - (b.hours || 0);
          if (diff !== 0) return diff;
          return (a.name || "").localeCompare(b.name || "");
        }
        case "nameAsc": {
          const diff = (a.name || "").localeCompare(b.name || "");
          if (diff !== 0) return diff;
          return parseDateMs(b.submitted) - parseDateMs(a.submitted);
        }
        case "nameDesc": {
          const diff = (b.name || "").localeCompare(a.name || "");
          if (diff !== 0) return diff;
          return parseDateMs(b.submitted) - parseDateMs(a.submitted);
        }
        case "regAsc": {
          const diff = (a.registrationNumber || "").localeCompare(b.registrationNumber || "");
          if (diff !== 0) return diff;
          return parseDateMs(b.submitted) - parseDateMs(a.submitted);
        }
        default:
          return 0;
      }
    });
    return list;
  }, [filteredRequests, sortBy]);

  const groupedRequests = useMemo(() => {
    if (groupBy === "none") return [];

    const map = new Map<string, RequestGroup>();

    for (const req of sortedRequests) {
      let key = "";
      let title = "";
      let subtitle: string | undefined = undefined;

      if (groupBy === "student") {
        key = (req.registrationNumber || req.name || "unknown").trim();
        title = req.name || "Unknown Student";
        subtitle = req.registrationNumber || undefined;
      } else if (groupBy === "workSlab") {
        key = (req.workSlab || "Unassigned").trim();
        title = req.workSlab || "Unassigned Category";
      } else if (groupBy === "workType") {
        key = (req.workType || "Other").trim();
        title = req.workType || "Other Type";
        subtitle = req.workSlab || undefined;
      } else if (groupBy === "date") {
        key = req.date || "unknown";
        title = formatGroupDate(req.date);
      }

      if (!map.has(key)) {
        map.set(key, {
          key,
          title,
          subtitle,
          items: [],
          totalHours: 0,
        });
      }

      const g = map.get(key)!;
      g.items.push(req);
      g.totalHours = Math.round((g.totalHours + (req.hours || 0)) * 100) / 100;
    }

    const groupList = Array.from(map.values());

    // Sort the groups logically
    groupList.sort((a, b) => {
      if (groupBy === "date") {
        if (sortBy === "dateAsc") {
          return parseDateMs(a.key) - parseDateMs(b.key);
        }
        return parseDateMs(b.key) - parseDateMs(a.key);
      }
      if (groupBy === "student") {
        if (sortBy === "regAsc") {
          return (a.subtitle || "").localeCompare(b.subtitle || "");
        }
        if (sortBy === "hoursDesc") {
          return b.totalHours - a.totalHours;
        }
        if (sortBy === "hoursAsc") {
          return a.totalHours - b.totalHours;
        }
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "hoursDesc") {
        return b.totalHours - a.totalHours;
      }
      if (sortBy === "hoursAsc") {
        return a.totalHours - b.totalHours;
      }
      return a.title.localeCompare(b.title);
    });

    return groupList;
  }, [sortedRequests, groupBy, sortBy]);

  const totalFilteredHours = useMemo(() => {
    const sum = filteredRequests.reduce((acc, r) => acc + (r.hours || 0), 0);
    return Math.round(sum * 100) / 100;
  }, [filteredRequests]);

  const allGroupKeys = useMemo(() => groupedRequests.map((g) => g.key), [groupedRequests]);
  const isAllCollapsed = allGroupKeys.length > 0 && allGroupKeys.every((k) => collapsedGroups[k]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllGroups = () => {
    if (isAllCollapsed) {
      setCollapsedGroups({});
    } else {
      const map: Record<string, boolean> = {};
      allGroupKeys.forEach((k) => {
        map[k] = true;
      });
      setCollapsedGroups(map);
    }
  };

  const renderGroupIcon = (type: GroupByOption) => {
    switch (type) {
      case "student":
        return <UserIcon className="w-4 h-4 text-sky-400" />;
      case "workSlab":
        return <LayersIcon className="w-4 h-4 text-purple-400" />;
      case "workType":
        return <SlidersHorizontalIcon className="w-4 h-4 text-emerald-400" />;
      case "date":
        return <CalendarIcon className="w-4 h-4 text-amber-400" />;
      default:
        return <LayersIcon className="w-4 h-4 text-gray-400" />;
    }
  };

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

  const handleModalConfirm = async (
    hours: number,
    newFile?: File | null,
    removeProof?: boolean
  ) => {
    if (!selectedRequest) return;
    setIsEditModalOpen(false);

    if (isApproving) {
      setLoading(true, "Approving request...");
      try {
        let newProofData = undefined;
        if (newFile) {
          newProofData = await ImageService.uploadImage(newFile, selectedRequest.id);
        }
        await RequestsService.handleRequestAction(
          selectedRequest.id,
          "approved",
          hours,
          newProofData,
          removeProof
        );
        showAlert("Request approved", AlertType.SUCCESS);
        refreshRequests();
      } catch (err) {
        setError(err as string);
      }
      setLoading(false);
    } else {
      setLoading(true, "Updating request...");
      try {
        await RequestsService.updateApprovedRequest(
          selectedRequest.id,
          hours,
          newFile,
          removeProof
        );
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

  if (error) return <Navigate to={"/error"} />;

  if (totalRequestsInStatus === 0) {
    return (
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
    );
  }

  return (
    <>
      {/* Controls Bar: Search, Group By & Sort */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={`Filter ${status} by student, ID, work...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-xs text-white placeholder-gray-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                title="Clear filter"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Group By and Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Group By Select */}
            <div className="relative inline-flex items-center">
              <LayersIcon className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={groupBy}
                onChange={(e) => {
                  setGroupBy(e.target.value as GroupByOption);
                  setCollapsedGroups({});
                }}
                className="bg-[#0a0a0a] hover:bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-xs font-bold text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer appearance-none transition-colors"
                title="Group requests by property"
              >
                <option value="none" className="bg-[#121212] text-white">Group: None</option>
                <option value="student" className="bg-[#121212] text-white">Group: By Student</option>
                <option value="workSlab" className="bg-[#121212] text-white">Group: By Work Slab</option>
                <option value="workType" className="bg-[#121212] text-white">Group: By Work Type</option>
                <option value="date" className="bg-[#121212] text-white">Group: By Work Date</option>
              </select>
              <ChevronDownIcon className="absolute right-2.5 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>

            {/* Sort By Select */}
            <div className="relative inline-flex items-center">
              <ArrowUpDownIcon className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#0a0a0a] hover:bg-white/5 border border-white/10 rounded-xl pl-8 pr-8 py-2.5 text-xs font-bold text-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer appearance-none transition-colors"
                title="Sort requests"
              >
                <option value="submittedDesc" className="bg-[#121212] text-white">Submitted: Newest First</option>
                <option value="submittedAsc" className="bg-[#121212] text-white">Submitted: Oldest First (FIFO)</option>
                <option value="dateDesc" className="bg-[#121212] text-white">Work Date: Newest First</option>
                <option value="dateAsc" className="bg-[#121212] text-white">Work Date: Oldest First</option>
                <option value="hoursDesc" className="bg-[#121212] text-white">Hours: High to Low</option>
                <option value="hoursAsc" className="bg-[#121212] text-white">Hours: Low to High</option>
                <option value="nameAsc" className="bg-[#121212] text-white">Student Name (A-Z)</option>
                <option value="nameDesc" className="bg-[#121212] text-white">Student Name (Z-A)</option>
                <option value="regAsc" className="bg-[#121212] text-white">Reg Number (A-Z)</option>
              </select>
              <ChevronDownIcon className="absolute right-2.5 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sub Row: Counters and Group Expand/Collapse Controls */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-white">{filteredRequests.length}</strong> {filteredRequests.length === 1 ? "request" : "requests"}
            </span>
            <span className="text-gray-600">•</span>
            <span>
              Total <strong className="text-amber-300 font-mono">{totalFilteredHours} hrs</strong>
            </span>
            {groupBy !== "none" && (
              <>
                <span className="text-gray-600">•</span>
                <span>
                  Across <strong className="text-white">{groupedRequests.length}</strong> {groupedRequests.length === 1 ? "group" : "groups"}
                </span>
              </>
            )}
          </div>

          {groupBy !== "none" && groupedRequests.length > 0 && (
            <button
              type="button"
              onClick={toggleAllGroups}
              className="text-xs text-gray-400 hover:text-white transition-colors font-medium hover:underline flex items-center gap-1 cursor-pointer"
            >
              {isAllCollapsed ? (
                <>
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                  Expand all
                </>
              ) : (
                <>
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                  Collapse all
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* No Search Matches */}
      {filteredRequests.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/5 rounded-full shadow-sm">
              <SearchIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <p className="text-lg font-medium text-white">No matching requests</p>
          <p className="text-sm text-gray-400 mt-1">
            No {status} requests match &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Clear Filter
          </button>
        </motion.div>
      ) : groupBy === "none" ? (
        /* Flat List */
        <div className="divide-y divide-white/5 bg-[#0a0a0a]/50 rounded-[2rem] border border-white/5 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {sortedRequests.map((request) => (
              <RequestCardItem
                key={request.id}
                request={request}
                setSelectedProofImage={setSelectedProofImage}
                setisProofModalOpen={setisProofModalOpen}
                handleReject={handleReject}
                handleApproveClick={handleApproveClick}
                handleEditClick={handleEditClick}
                handleDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Grouped List */
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {groupedRequests.map((group) => {
              const isCollapsed = !!collapsedGroups[group.key];
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  key={group.key}
                  className="bg-[#0a0a0a]/50 rounded-[2rem] border border-white/5 overflow-hidden transition-all shadow-sm"
                >
                  {/* Group Header Banner */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    className="w-full p-4 sm:px-6 sm:py-5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors border-b border-white/5 flex items-center justify-between gap-4 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
                        {renderGroupIcon(groupBy)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate">
                            {group.title}
                          </h3>
                          {group.subtitle && (
                            <span className="text-xs font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                              {group.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/5">
                        {group.items.length} {group.items.length === 1 ? "request" : "requests"}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {group.totalHours} hrs
                      </span>
                      <div
                        className={`p-1 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-transform duration-200 ${
                          isCollapsed ? "" : "rotate-180"
                        }`}
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </div>
                    </div>
                  </button>

                  {/* Group Items */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="divide-y divide-white/5"
                      >
                        {group.items.map((request) => (
                          <RequestCardItem
                            key={request.id}
                            request={request}
                            setSelectedProofImage={setSelectedProofImage}
                            setisProofModalOpen={setisProofModalOpen}
                            handleReject={handleReject}
                            handleApproveClick={handleApproveClick}
                            handleEditClick={handleEditClick}
                            handleDelete={handleDelete}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <EditRequestModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleModalConfirm}
        initialHours={selectedRequest?.hours || 0}
        initialProofUrl={
          typeof selectedRequest?.proof === "string"
            ? selectedRequest.proof
            : selectedRequest?.proof?.url || (selectedRequest as any)?.proofUrl || null
        }
        title={isApproving ? "Approve Request" : "Edit Request & Proof"}
        isApproving={isApproving}
      />
    </>
  );
}

export default RequestsList;
