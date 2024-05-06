import SearchHeader from "./SearchHeader";
import SearchInput from "./SearchInput";

export default function SearchSection() {
  return (
    <div className="flex flex-col items-center justify-center w-full gap-5 pb-10">
      <div className="w-[750px] flex flex-col justify-center items-center gap-5">
        <SearchHeader />
        <SearchInput />
      </div>
    </div>
  );
}
