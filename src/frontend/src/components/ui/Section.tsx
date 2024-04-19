export default function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-[750px] border-zinc-700/50 border-[1px] bg-zinc-900 px-5 py-5 drop-shadow-xl rounded-3xl flex flex-col items-center">
      <div className="flex flex-col w-full py-5 md:px-8">{children}</div>
    </section>
  );
}
