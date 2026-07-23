import { cn } from "@/lib/utils";
import { avatarSrcForName, normalizeGuestName } from "@/lib/retro/team-roster";

const SIZE_CLASS = {
  "2xs": "h-4 w-4 text-[8px]",
  xs: "h-5 w-5 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-sm"
} as const;

type PersonAvatarProps = {
  name: string;
  color?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
  title?: string;
};

export function PersonAvatar({ name, color, size = "md", className, title }: PersonAvatarProps) {
  const src = avatarSrcForName(name);
  const label = title ?? name;
  const sizeClass = SIZE_CLASS[size];
  const containFit = normalizeGuestName(name) === "scooby";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        title={label}
        className={cn(
          "shrink-0 rounded-full border border-[#ded8e8] shadow-sm",
          containFit ? "bg-black object-contain p-0.5" : "object-cover object-top",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <span
      title={label}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white shadow-sm",
        sizeClass,
        className
      )}
      style={{ backgroundColor: color ?? "#71717a" }}
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}
