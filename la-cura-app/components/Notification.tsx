"use client";

import { CheckCircle, AlertCircle, X } from "lucide-react";

type Props = {
  message: string;
  type: "success" | "error";
  onClose?: () => void;
};

export default function Notification({
  message,
  type,
  onClose,
}: Props) {
  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-[3px] border px-3 py-2.5 text-[11px] shadow-sm text-white animate-[slideIn_.35s_ease]

      ${
        type === "success"
          ? "bg-[#073B2F]"
          : "bg-red-600"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={24} />
      ) : (
        <AlertCircle size={24} />
      )}

      <span className="font-medium">
        {message}
      </span>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-2"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}