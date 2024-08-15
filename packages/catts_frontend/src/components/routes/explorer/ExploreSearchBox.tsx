import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";

export default function ExploreSearchBox() {
  const navigate = useNavigate();

  function search(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && event.currentTarget.value.length >= 3) {
      event.preventDefault();
      navigate({ to: "/search", search: { q: event.currentTarget.value } });
    }
  }

  return (
    <div className="relative w-full md:w-[500px]">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        className="pl-10"
        onKeyDown={search}
        placeholder="Search by name, description, creator, or keyword"
        type="text"
      />
    </div>
  );
}
