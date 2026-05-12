import { FormEvent, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { AppModal } from "@/components/retro/AppModal";

type SupportModalProps = {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  onSubmit: (payload: { name: string; description: string }) => Promise<boolean>;
};

export function SupportModal({ open, defaultName, onClose, onSubmit }: SupportModalProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setDescription("");
      setIsSubmitting(false);
    }
  }, [defaultName, open]);

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      return;
    }

    setIsSubmitting(true);
    const saved = await onSubmit({ name: trimmedName, description: trimmedDescription });
    setIsSubmitting(false);

    if (saved) {
      onClose();
    }
  }

  return (
    <AppModal open={open} eyebrow="Support" title="Send a support ticket" closeOnOutside onClose={onClose}>
      <form onSubmit={submitTicket} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-[#ded8e8] bg-[#f7f5f0] px-3 py-3 text-sm font-bold text-slate-950 outline-none focus:border-[#8c83ad]"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-2xl border border-[#ded8e8] bg-[#f7f5f0] px-3 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8c83ad]"
            placeholder="What should support know?"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !description.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#343052] px-4 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_-22px_rgba(52,48,82,0.58)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send ticket"}
        </button>
      </form>
    </AppModal>
  );
}
