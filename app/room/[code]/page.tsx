export default function RoomPage({ params }: { params: { code: string } }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">多人房间 - 房间码: {params.code}</h1>
      <p>等待玩家加入...</p>
    </div>
  );
}
