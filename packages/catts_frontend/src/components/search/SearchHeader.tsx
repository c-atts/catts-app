export default function SearchHeader() {
  return (
    <div className="pb-10">
      <h1 className="text-5xl text-white font-bold leading-[60px] text-center">
        Create, combine, move and transform attestations!
      </h1>
      <div className="flex flex-col items-center gap-5">
        <div>Supports:</div>
        <div className="flex justify-center gap-10 w-full">
          <img src="/thegraph.svg" className="w-14 h-14" />
          <img src="/eas.png" className="w-14 h-14" />
        </div>
      </div>
    </div>
  );
}
