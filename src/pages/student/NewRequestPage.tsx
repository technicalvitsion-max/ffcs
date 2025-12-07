import {
  useAlert,
  type AlertContextType,
} from "@/context/AlertContext";
import { useAuth, type AuthContextType } from "@/context/AuthContext";
import { useLoader, type LoaderContextType } from "@/context/LoaderContext";
import { WORK_TYPES } from "@/lib/constants";
import { AlertType, type HourRequestInput } from "@/lib/types";
import { RequestsService } from "@/services/requests";
import { ArrowLeftIcon, UploadIcon, FileIcon, CheckCircleIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NewRequestForm = () => {
  const { user } = useAuth() as AuthContextType;
  const { showAlert } = useAlert() as AlertContextType;
  const { setLoading } = useLoader() as LoaderContextType;
  const [workName, setWorkName] = useState("");
  const [workSlab, setWorkSlab] = useState("");
  const [workType, setWorkType] = useState("");
  const [description, setDescription] = useState("");
  // Derived state for work types
  const currentWorkTypes = workSlab ? WORK_TYPES[workSlab] : [];

  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileName(event.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true, "Submitting request");
    event.preventDefault();
    let file = null;
    if (fileInputRef.current && fileInputRef.current.files?.length) {
      file = fileInputRef.current.files[0];
    }

    const formData: HourRequestInput = {
      workName,
      workSlab,
      workType,
      description,
      date,
      hours: Number(hours),
      file,
    };
    console.log("Submitting new request:", formData);
    try {
      await RequestsService.submitNewRequest(formData, user!);

      showAlert("Request submitted successfully", AlertType.SUCCESS);
      setWorkName("");
      setWorkType("");
      setWorkSlab("");
      setDescription("");
      setDate("");
      setHours("");
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (error) {
      showAlert(error as string);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6 md:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <button
          onClick={() => {
            navigate(-1);
          }}
          className="group flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors mb-6"
        >
          <div className="p-1.5 rounded-full bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-colors">
            <ArrowLeftIcon className="w-4 h-4" />
          </div>
          Back to Dashboard
        </button>

        <div className="bg-[#121212] rounded-[2rem] shadow-2xl shadow-black/50 border border-white/10 overflow-hidden relative">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="p-6 sm:p-8 border-b border-white/5 bg-white/5 relative z-10">
            <h2 className="text-2xl font-bold text-white">
              Submit New Hour Request
            </h2>
            <p className="text-gray-400 mt-1">
              Fill in the details below to log your work hours.
            </p>
          </div>

          <form className="p-6 sm:p-8 space-y-6 relative z-10">
            {/* Work Name */}
            <div>
              <label
                htmlFor="workName"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Work Name
              </label>
              <input
                type="text"
                id="workName"
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white text-white placeholder-gray-600 transition-all"
                placeholder="e.g., Website Development"
                required
              />
            </div>

            {/* Work Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="workSlab"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Work Slab
                </label>
                <div className="relative">
                  <select
                    id="workSlab"
                    value={workSlab}
                    onChange={(e) => setWorkSlab(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white text-white appearance-none transition-all"
                    required
                  >
                    <option value="" disabled className="text-gray-500">
                      Select a slab
                    </option>
                    {Object.keys(WORK_TYPES).map((type, index) => {
                      return (
                        <option key={index} value={type} className="bg-[#121212]">
                          {type}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="workType"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Type of Work
                </label>
                <div className="relative">
                  <select
                    id="workType"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white text-white appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={!workSlab}
                  >
                    <option value="" disabled className="text-gray-500">
                      Select a type
                    </option>
                    {currentWorkTypes.map((type, ind) => (
                      <option key={ind} value={type} className="bg-[#121212]">
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white text-white placeholder-gray-600 transition-all resize-none"
                placeholder="Describe the work you did..."
                required
              />
            </div>

            {/* Date and Hours (Side-by-side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Date of Work
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white text-white color-scheme-dark transition-all"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="hours"
                  className="block text-sm font-semibold text-gray-300 mb-2"
                >
                  Hours Claimed
                </label>
                <input
                  type="number"
                  id="hours"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white text-white placeholder-gray-600 transition-all"
                  placeholder="e.g., 8"
                  required
                />
              </div>
            </div>

            {/* File Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Proof of Work (Geotag photo)
              </label>
              <div
                className={`mt-1 flex justify-center p-8 border-2 border-dashed rounded-xl transition-all duration-200 ${fileName ? "border-green-500/50 bg-green-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
              >
                <div className="space-y-2 text-center">
                  {fileName ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2">
                        <CheckCircleIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-white">{fileName}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFileName("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-xs text-red-400 hover:text-red-300 mt-1 font-medium transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mb-2">
                        <UploadIcon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col sm:flex-row text-sm text-gray-400 items-center justify-center gap-1">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer font-bold text-white hover:text-gray-200 focus-within:outline-none transition-colors"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                          />
                        </label>
                        <p className="text-gray-500">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-200 hover:shadow-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 active:scale-95"
                onClick={handleSubmit}
              >
                <FileIcon className="w-5 h-5" />
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NewRequestForm;
