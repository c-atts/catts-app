import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export default function ExploreSearchBox() {
  return (
    <div className="relative w-[500px]">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        className="pl-10"
        type="text"
        placeholder="Search by name, description, creator, or keyword"
      />
    </div>
  );
}
