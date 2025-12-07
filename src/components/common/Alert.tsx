import type React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { useAlert, type AlertContextType } from "@/context/AlertContext";

export const Alert: React.FC = () => {
  const { alert, isVisible } = useAlert() as AlertContextType;
  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-500",
      icon: CheckCircle,
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-500",
      icon: AlertTriangle,
    },
    danger: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-500",
      icon: AlertCircle,
    },
  };

  const config = typeConfig[alert.type as "success" | "warning" | "danger"];

  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-[999] flex items-center gap-4 px-6 py-4 rounded-lg border-l-4 ${config.bgColor} ${config.borderColor} shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 max-w-sm`}
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${config.iconColor}`} />
      <p className={`text-base font-medium ${config.textColor}`}>
        {alert.title}
      </p>
    </div>
  );
};
