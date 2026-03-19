import React from "react";

// ── EmptyState: Reusable empty state with icon + message ──
const EmptyState = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[#e8612a]/10 flex items-center justify-center mb-4">
          <Icon size={28} className="text-[#e8612a]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default EmptyState;
