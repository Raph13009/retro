import { useState } from "react";
import { AppModal } from "@/components/retro/AppModal";
import { cn } from "@/lib/utils";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmModal({
  open,
  title,
  text,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "primary",
  onCancel,
  onConfirm
}: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
    onCancel();
  }

  return (
    <AppModal
      open={open}
      eyebrow="Confirmation"
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" onClick={onCancel} className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-extrabold text-slate-600 shadow-sm">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              void submit();
            }}
            disabled={isSubmitting}
            className={cn(
              "flex-[1.2] rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60",
              tone === "danger" ? "bg-rose-500 shadow-rose-300/40" : "bg-slate-950 shadow-slate-400/30"
            )}
          >
            {isSubmitting ? "Saving..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">{text}</p>
    </AppModal>
  );
}
