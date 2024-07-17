import Button from "../ui/Button";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function CreateButton() {
  return (
    <>
      <Button className="" icon={faPlus} variant="dark">
        Create recipe
      </Button>
    </>
  );
}
