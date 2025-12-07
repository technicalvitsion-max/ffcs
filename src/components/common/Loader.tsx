import { useLoader, type LoaderContextType } from "@/context/LoaderContext";

export function Loader() {
  const { isLoading, message } = useLoader() as LoaderContextType;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex flex-col items-center justify-center z-[9999]">
      {/* Spinner */}
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 border-4 border-slate-300 rounded-full opacity-25"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
      </div>

      {message && (
        <p className="text-slate-300 text-sm font-medium animate-pulse text-center">
          {typeof message === "string"
            ? message
            : message.map((m) => (
                <p>
                  {m} <br />
                </p>
              ))}
        </p>
      )}
    </div>
  );
}

export function StaticLoader({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex flex-col items-center justify-center z-[9999]">
      {/* Spinner */}
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 border-4 border-slate-300 rounded-full opacity-25"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-slate-300 text-sm font-medium animate-pulse text-center">
        Loading
      </p>
    </div>
  );
}
