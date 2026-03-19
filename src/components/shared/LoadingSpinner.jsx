import React from "react";
import { Loader2 } from "lucide-react";

// ── LoadingSpinner: Centered spinner with brand orange ──
const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 size={32} className="animate-spin text-[#e8612a] mb-3" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
