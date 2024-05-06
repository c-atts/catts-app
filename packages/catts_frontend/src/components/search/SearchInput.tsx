import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function SearchInput() {
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle enter
    if (e.keyCode === 13) {
      toast.success("Search not implemented yet");
    }
  };
  return (
    <div className="flex justify-center w-full ">
      <div className="relative flex-grow">
        <FontAwesomeIcon
          className="absolute w-4 h-4 top-3 left-3 text-theme-5"
          icon={faSearch}
        />

        <input
          className="w-full p-2 pl-10 text-gray-500 placeholder-gray-400 border-none hover:ring-4 hover:ring-theme-3 hover:ring-opacity-40 focus:ring-4 focus:ring-theme-3 rounded-xl shadow-theme-3 focus:shadow-theme-3 focus:outline-none"
          onKeyUp={handleKeyUp}
          placeholder="Search recipes"
          spellCheck={false}
          type="text"
        />
      </div>
    </div>
  );
}
