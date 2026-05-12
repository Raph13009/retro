type AppToastProps = {
  message: string;
  onClose?: () => void;
};

export function AppToast({ message, onClose }: AppToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed right-5 top-5 z-50 max-w-md rounded-2xl border border-violet-200/30 bg-white/90 px-4 py-3 text-sm font-bold text-slate-800 shadow-2xl shadow-violet-950/20 backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.9)]" />
        <p className="leading-5">{message}</p>
        {onClose ? (
          <button type="button" onClick={onClose} className="ml-auto rounded-full px-2 text-xs font-extrabold text-violet-600 hover:bg-violet-50">
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
