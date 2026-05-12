import type { ReactNode } from "react";
import { X } from "lucide-react";

type AppModalProps = {
  open: boolean;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOutside?: boolean;
  onClose: () => void;
};

export function AppModal({ open, eyebrow, title, children, footer, closeOnOutside = false, onClose }: AppModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/24 p-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (closeOnOutside && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#ded8e8]/80 bg-white text-slate-950 shadow-[0_28px_90px_-42px_rgba(49,46,78,0.42)]">
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            {eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#6d668f]">{eyebrow}</p> : null}
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-[#f1eef6]" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
        {footer ? <div className="flex gap-2 border-t border-[#ded8e8] bg-[#f7f5f0] p-5">{footer}</div> : null}
      </section>
    </div>
  );
}
