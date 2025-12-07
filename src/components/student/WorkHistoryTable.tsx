import type { HourRequest } from "@/lib/types";
import { ClockIcon, CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function WorkHistoryTable({ data }: { data: HourRequest[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white/5">
        <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center shadow-sm mb-4">
          <ClockIcon className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-white font-bold text-lg">No work records found</p>
        <p className="text-gray-500 text-sm mt-1">
          Start by creating a new request!
        </p>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-white/5 text-gray-400 border-white/10";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-white/5">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Work Details
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Slab
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Hours
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
              Approved/Rejected
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          <AnimatePresence>
            {data.map((work, index) => (
              <motion.tr
                key={work.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="font-bold text-white group-hover:text-gray-300 transition-colors">
                    {work.workName}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300 border border-white/5">
                    {work.workSlab}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-300 border border-white/5">
                    {work.workType}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                    {formatDate(work.date)}
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-sm font-bold text-white">
                    {work.hours}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(
                      work.status
                    )}`}
                  >
                    {work.status.charAt(0).toUpperCase() + work.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(work.submitted)}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                  {work.status === "approved" && formatDate(work.approved!)}
                  {work.status === "rejected" && formatDate(work.rejected!)}
                  {work.status === "pending" && "-"}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
