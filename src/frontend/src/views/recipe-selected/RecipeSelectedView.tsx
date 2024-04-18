import BackButton from "../../components/BackButton";
import CreateAttestation from "./components/CreateAttestation";
import InitRun from "./components/InitRun";
import PayForRun from "./components/PayForRun";
import RecipeBasics from "./components/RecipeBasics";
import RecipeDetails from "./components/RecipeDetails";
import SimulateRun from "./components/SimulateRun";

export default function RecipeSelectedView() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <BackButton />
      <RecipeBasics />
      <RecipeDetails />
      <SimulateRun />
      <InitRun />
      <PayForRun />
      <CreateAttestation />
    </div>
  );
}
