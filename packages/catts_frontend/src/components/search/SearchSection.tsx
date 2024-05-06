import SearchHeader from "./SearchHeader";
import SearchInput from "./SearchInput";

export default function SearchSection() {
  return (
    <div className="flex flex-col bg-theme-100/20 w-full justify-center items-center pb-10 gap-5">
      <div className="w-[750px] flex flex-col justify-center items-center gap-5">
        <SearchHeader />
        <SearchInput />
      </div>
    </div>
  );
}
