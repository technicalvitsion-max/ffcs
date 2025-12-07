import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import { UploadIcon, FileSpreadsheetIcon, UserIcon, CalendarIcon } from "lucide-react";
import React, { useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";

function StudentsRosterPage() {
  const [uploadYear, setUploadYear] = useState<number>(
    new Date().getFullYear() - 1
  );
  const [uploaderName, setUploaderName] = useState<string>("Nizam");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPending] = useTransition();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file: File = event.target.files![0];

    if (file) {
      // upload roster
      console.log("flag");

      //   startTransition(async () => {
      //     await uploadStudentsRoster(
      //       uploaderName as string,
      //       uploadYear as number,
      //       await file.arrayBuffer()
      //     );
      //     alert("Student data uploaded successfully");
      //   });

      // generate report and delete old data
    }
  };

  const handleConfirmUpload = () => {
    //
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 md:p-8 lg:p-12 min-h-screen bg-[#0a0a0a]"
      >
        <div className="bg-[#121212] p-8 rounded-[2.5rem] shadow-2xl border border-white/10 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
              <FileSpreadsheetIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Upload Student Roster
              </h2>
              <p className="text-gray-400 mt-1">
                Upload a CSV file to populate the student database.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="uploaderName"
                className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide"
              >
                Uploader Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  id="uploaderName"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 text-white placeholder-gray-600 transition-all font-medium"
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="uploadYear"
                className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide"
              >
                Academic Year
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="number"
                  id="uploadYear"
                  value={uploadYear}
                  onChange={(e) =>
                    setUploadYear(e.target.value as unknown as number)
                  }
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 text-white placeholder-gray-600 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-2xl p-8 text-center mb-8 hover:bg-white/5 transition-colors group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".csv"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <div className="p-4 bg-white/5 rounded-full shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-300">
                <UploadIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-white font-bold hover:underline">
                  Click to upload
                </span>{" "}
                <span className="text-gray-500">or drag and drop</span>
              </div>
              <p className="text-xs text-gray-600 font-mono bg-white/5 px-2 py-1 rounded-md">CSV files only</p>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-95 ${uploaderName === "" || !uploadYear || isPending
                ? "bg-gray-800 cursor-not-allowed text-gray-500"
                : "bg-white text-black hover:bg-gray-200 shadow-white/10"
                }`}
              disabled={uploaderName === "" || !uploadYear || isPending}
            >
              {isPending ? (
                "Uploading..."
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  Upload Roster
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmPassword("");
        }}
        onConfirm={handleConfirmUpload}
        password={confirmPassword}
        setPassword={setConfirmPassword}
      />
    </>
  );
}

export default StudentsRosterPage;
