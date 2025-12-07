import { type Student } from "@/lib/types";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, ChevronRightIcon, UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function StudentsTable({ students }: { students: Partial<Student>[] }) {
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query.trim()) return students;

    const lower = query.toLowerCase();
    return students.filter(
      (s) =>
        s.name!.toLowerCase().includes(lower) ||
        s.registrationNumber!.toLowerCase().includes(lower)
    );
  }, [query, students]);

  return (
    <div className="bg-[#121212] rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Student Contributions
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            View and manage student hours
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white transition-all text-sm text-white placeholder-gray-600"
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-white/5">
            <tr>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Student Name
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Student ID
              </th>
              <th
                scope="col"
                className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
              >
                Total Approved Hours
              </th>
              <th scope="col" className="relative px-6 py-5">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence>
              {filtered.map((student, index) => (
                <motion.tr
                  key={student.registrationNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    navigate(`/dashboard/student/${student.registrationNumber}`);
                  }}
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs border border-white/10">
                        {student.name?.charAt(0)}
                      </div>
                      <div className="text-sm font-medium text-white group-hover:text-gray-300 transition-colors">
                        {student.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400 font-mono">
                    {student.registrationNumber}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                      {student.hours} hrs
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors inline-block" />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <UserIcon className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-lg font-medium text-white">
              No students found
            </p>
            <p className="text-sm">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsTable;
