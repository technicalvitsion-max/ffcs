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
import { DatePicker } from "@/components/common/DatePicker";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showAlert("Please upload a valid image file (PNG, JPG, JPEG)", AlertType.DANGER);
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!workName.trim() || !workSlab || !workType || !date || !hours) {
      showAlert("Please fill in all required work details", AlertType.DANGER);
      return;
    }

    if (!selectedFile) {
      showAlert("Proof of work photograph is mandatory", AlertType.DANGER);
      return;
    }

    setLoading(true, "Compressing & uploading proof...");

    const formData: HourRequestInput = {
      workName,
      workSlab,
      workType,
      description,
      date,
      hours: Number(hours),
      file: selectedFile,
    };

    try {
      await RequestsService.submitNewRequest(formData, user!);

      showAlert("Request and proof submitted successfully!", AlertType.SUCCESS);
      setWorkName("");
      setWorkType("");
      setWorkSlab("");
      setDescription("");
      setDate("");
      setHours("");
      handleRemoveFile();
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      showAlert(typeof error === "string" ? error : "Failed to submit request");
    } finally {
      setLoading(false);
    }
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
                <DatePicker
                  id="date"
                  value={date}
                  onChange={(selectedDate) => setDate(selectedDate)}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Proof of Work (Geotag photo) <span className="text-red-400">*</span>
                </label>
                {selectedFile && (
                  <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Photo attached
                  </span>
                )}
              </div>

              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  if (!selectedFile && fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
                className={`mt-1 flex justify-center p-6 sm:p-8 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${
                  selectedFile
                    ? "border-green-500/40 bg-green-500/5 cursor-default"
                    : isDragging
                    ? "border-white bg-white/10 scale-[1.01]"
                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
                }`}
              >
                {selectedFile && previewUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full">
                    <div className="relative group">
                      <img
                        src={previewUrl}
                        alt="Proof Preview"
                        className="w-28 h-28 object-cover rounded-xl border border-white/20 shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Preview</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <p className="text-sm font-bold text-white break-all">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400">
                        Size: {(selectedFile.size / 1024).toFixed(1)} KB • Image ready for upload
                      </p>
                      <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
                        >
                          Change photo
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-center">
                    <div className="mx-auto w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mb-1">
                      <UploadIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Click to select photo <span className="font-normal text-gray-400">or drag and drop</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload your geotag photo or event proof (PNG, JPG, JPEG)
                      </p>
                    </div>
                  </div>
                )}
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
