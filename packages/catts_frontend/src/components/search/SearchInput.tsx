import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function SearchInput() {
  const handleKeyUp = (e) => {
    // Handle enter
    if (e.keyCode === 13) {
      toast.success("Search not implemented yet");
    }
  };
  return (
    <div className="flex justify-center w-full ">
      <div className="relative flex-grow">
        <FontAwesomeIcon
          className="absolute w-4 h-4 top-3 left-3 text-theme-500"
          icon={faSearch}
        />

        <input
          className="w-full p-2 pl-10 border-none text-gray-500 placeholder-gray-300 hover:ring-4 hover:ring-theme-500 hover:ring-opacity-40 focus:ring-4 focus:ring-theme-500 rounded-xl shadow-theme-800 focus:shadow-theme-800 focus:outline-none"
          onKeyUp={handleKeyUp}
          placeholder="Search recipes"
          spellCheck={false}
          type="text"
        />
      </div>
    </div>
  );
}
