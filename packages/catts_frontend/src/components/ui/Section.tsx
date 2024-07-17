export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full border-[1px] bg-card p-10 shadow-sm rounded-lg flex flex-col items-center">
      <div className="flex flex-col w-full">{children}</div>
    </section>
  );
}
