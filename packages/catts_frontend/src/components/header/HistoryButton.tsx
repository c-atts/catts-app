import { useSetAtom } from "jotai";
import Button from "../ui/Button";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { routeAtom } from "../../state";

export default function HistoryButton() {
  const setRoute = useSetAtom(routeAtom);
  return (
    <>
      <Button
        className=""
        icon={faHistory}
        onClick={() => setRoute("history")}
        variant="dark"
      >
        Run history
      </Button>
    </>
  );
}
