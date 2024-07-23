function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="w-full border-[1px] bg-card p-10 shadow-sm rounded-lg flex flex-col items-center">
      <div className="flex flex-col w-full gap-5">{children}</div>
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold leading-none tracking-tight">
      {children}
    </h2>
  );
}

export { Section, SectionTitle };
