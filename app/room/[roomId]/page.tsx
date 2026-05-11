import { RetroApp } from "@/components/retro/RetroApp";

type RoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;

  return <RetroApp roomSlug={roomId} />;
}
