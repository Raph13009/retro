type AppToastProps = {
  message: string;
  onClose?: () => void;
};

export function AppToast({ message, onClose }: AppToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-5 top-5 z-50 max-w-md rounded-2xl border border-[#ded8e8]/80 bg-white/92 px-4 py-3 text-sm font-bold text-slate-800 shadow-[0_24px_70px_-42px_rgba(49,46,78,0.38)] backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6d668f]" />
        <p className="leading-5">{message}</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="ml-auto rounded-full px-2 text-xs font-extrabold text-[#4f4974] hover:bg-[#f1eef6]">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
