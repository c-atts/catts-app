export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-[750px] border-zinc-700/50 border-[1px] bg-zinc-800 p-10 drop-shadow-xl rounded-2xl flex flex-col items-center">
      <div className="flex flex-col w-full">{children}</div>
    </section>
  );
}
