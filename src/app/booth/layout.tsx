import { BoothProvider } from "@/lib/booth-store";

export default function BoothLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BoothProvider>
      <div className="bg-soft min-h-screen">{children}</div>
    </BoothProvider>
  );
}
