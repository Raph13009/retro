import { AppBackground } from "@/components/retro/AppBackground";

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppBackground />
      {children}
    </>
  );
}
