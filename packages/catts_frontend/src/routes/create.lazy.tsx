import { createLazyFileRoute } from "@tanstack/react-router";
import CreateForm from "../components/routes/create/CreateForm";

export const Route = createLazyFileRoute("/create")({
  component: Index,
});

function Index() {
  return <CreateForm />;
}
