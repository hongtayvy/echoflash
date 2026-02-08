import TopBar from "./TopBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">{children}</main>
    </div>
  );
}
