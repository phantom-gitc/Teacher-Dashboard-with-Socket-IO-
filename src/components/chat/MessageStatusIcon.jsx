import React from "react";
import { Check, CheckCheck } from "lucide-react";

// ── MessageStatusIcon: tick/double-tick for message delivery status ──
const MessageStatusIcon = ({ status }) => {
  if (status === "read") {
    return <CheckCheck size={13} className="text-blue-400 transition-all duration-150" />;
  }
  if (status === "delivered") {
    return <CheckCheck size={13} className="text-gray-400 transition-all duration-150" />;
  }
  // sent (default)
  return <Check size={13} className="text-gray-400 transition-all duration-150" />;
};

export default MessageStatusIcon;
