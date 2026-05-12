import { FormEvent, useEffect, useState } from "react";
import { AppModal } from "@/components/retro/AppModal";
import type { CardGroup } from "@/lib/retro/types";

type RenameGroupModalProps = {
  group: CardGroup | null;
  onClose: () => void;
  onSave: (group: CardGroup, title: string) => Promise<void> | void;
};

export function RenameGroupModal({ group, onClose, onSave }: RenameGroupModalProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(group?.title ?? "");
  }, [group]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!group || !trimmedTitle) {
      return;
    }

    setIsSubmitting(true);
    await onSave(group, trimmedTitle);
    setIsSubmitting(false);
    onClose();
  }

  return (
    <AppModal open={Boolean(group)} eyebrow="Group" title="Rename group" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Group name</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-violet-400"
            autoFocus
          />
        </label>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-600">
            Cancel
          </button>
          <button type="submit" disabled={!title.trim() || isSubmitting} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60">
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
