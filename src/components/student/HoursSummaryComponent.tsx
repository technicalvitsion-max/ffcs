import { TOTAL_WORK_HOURS } from "@/lib/constants";
import { CheckCircleIcon, TrendingUpIcon } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  totalHours: number;
  remainingHours: number;
  progressPercentage: number;
};

export default function HoursSummary({
  totalHours,
  remainingHours,
  progressPercentage,
}: Props) {
  return (
    <div className="bg-[#121212] p-8 rounded-[2rem] mb-8 border border-white/10 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl text-white">
            <TrendingUpIcon size={20} />
          </div>
          <span>Progress Overview</span>
        </h3>
        {remainingHours <= 0 && (
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-4 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wide rounded-full flex items-center gap-2 border border-green-500/20"
          >
            <CheckCircleIcon size={14} /> Target Met
          </motion.span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center relative z-10">
        {/* Progress Bar Column */}
        <div className="md:col-span-1">
          <div className="flex justify-between text-sm mb-4">
            <span className="font-medium text-gray-400">Completion</span>
            <span className="font-bold text-white">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            />
          </div>
        </div>

        {/* Stats Columns */}
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-6">
          <div className="flex-1 p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 group">
            <p className="text-sm text-gray-500 font-medium mb-1 group-hover:text-gray-300 transition-colors">
              Total Approved
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight leading-none">
                {totalHours}
              </span>
              <span className="text-sm text-gray-400 font-medium">
                / {TOTAL_WORK_HOURS} hrs
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 group">
            <p className="text-sm text-gray-500 font-medium mb-1 group-hover:text-gray-300 transition-colors">Remaining</p>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-5xl font-black tracking-tight leading-none ${remainingHours > 0 ? "text-white" : "text-green-400"
                  }`}
              >
                {Math.max(0, remainingHours)}
              </span>
              <span className="text-sm text-gray-400 font-medium">
                hrs to go
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
