import CreateAttestation from "./components/CreateAttestation";
import InitRun from "./components/CreateRun";
import PayForRun from "./components/PayForRun";
import RecipeBasics from "./components/RecipeBasics";
import RecipeDetails from "./components/RecipeDetails";
import Section from "../../components/ui/Section";
import SimulateRun from "./components/SimulateRun";
import BackButton from "../../components/BackButton";

export default function RecipeSelectedView() {
  return (
    <Section>
      <div className="flex flex-col gap-5 p-5">
        <BackButton />
        <RecipeBasics />
        <RecipeDetails />
        <SimulateRun />
        <InitRun />
        <PayForRun />
        <CreateAttestation />
      </div>
    </Section>
  );
}
