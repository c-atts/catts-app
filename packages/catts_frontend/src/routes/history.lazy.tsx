import { createLazyFileRoute } from "@tanstack/react-router";
import RunHistory from "../components/routes/history/RunHistory";

export const Route = createLazyFileRoute("/history")({
  component: Index,
});

function Index() {
  return <RunHistory />;
}
