import { createLazyFileRoute } from "@tanstack/react-router";
import CreateForm from "../components/routes/create/CreateForm";
import CreateInfoBox from "@/components/routes/create/CreateInfoBox";

export const Route = createLazyFileRoute("/create")({
  component: Index,
});

function Index() {
  return (
    <div className="flex gap-5 w-full">
      <div className="flex flex-col gap-5 w-2/3">
        <CreateForm />
      </div>
      <div className="w-1/3">
        <CreateInfoBox />
      </div>
    </div>
  );
}
