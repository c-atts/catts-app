import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import Button from "../ui/Button";

export default function SearchInput() {
  const search = () => {
    toast.success("Search not implemented yet");
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle enter
    if (e.keyCode === 13) {
      search();
    }
  };

  const handleClick = () => {
    search();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-5 pb-10">
      <div className="w-[750px] flex flex-col justify-center items-center gap-5">
        <div className="flex justify-center w-full gap-5">
          <div className="relative flex-grow">
            <FontAwesomeIcon
              className="absolute w-4 h-4 top-3 left-3 text-theme-5"
              icon={faSearch}
            />

            <input
              className="w-full p-2 pl-10 text-gray-500 placeholder-gray-400 border-none hover:ring-4 hover:ring-theme-800 hover:ring-opacity-40 focus:ring-4 focus:ring-theme-800 rounded-xl shadow-theme-3 focus:shadow-theme-3 focus:outline-none"
              onKeyUp={handleKeyUp}
              placeholder="Search recipes"
              spellCheck={false}
              type="text"
            />
          </div>
          <Button onClick={handleClick}>Search</Button>
        </div>
      </div>
    </div>
  );
}
