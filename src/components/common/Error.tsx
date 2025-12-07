import { useError, type ErrorContextType } from "@/context/ErrorContext";
import { HomeIcon, TriangleAlertIcon } from "lucide-react";
const ErrorComponent = () => {
  const { error } = useError() as ErrorContextType;

  if (error.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden p-4">
      {/* Background Pattern (Consistent with Login) */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px]"></div>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 relative z-10 text-center">
        {/* Icon Header */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-6">
          <TriangleAlertIcon className="h-8 w-8 text-red-500" />
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          Whoops!
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">{error}</p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/")}
            className={`w-full flex items-center justify-center gap-2 bg-white text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200`}
          >
            <HomeIcon className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Error Code: 500 • VITSION FFCS
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
