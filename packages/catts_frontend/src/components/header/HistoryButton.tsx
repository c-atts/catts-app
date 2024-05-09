import Button from "../ui/Button";
import { faHistory } from "@fortawesome/free-solid-svg-icons";

export default function HistoryButton() {
  return (
    <>
      <Button className="" icon={faHistory} variant="dark">
        Run history
      </Button>
    </>
  );
}
