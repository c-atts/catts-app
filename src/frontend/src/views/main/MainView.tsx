import RecipesList from "./components/RecipesList";
import RunHistory from "./components/RunHistory";
import Section from "../../components/ui/Section";

export default function MainView() {
  return (
    <>
      <Section>
        <h2 className="text-theme-400">Recipes</h2>
        <p>
          Recipes define the ingredients that make up a composite attestation -
          the queries, variables and custom processing logic. C–ATTS uses{" "}
          <a href="https://attest.sh" rel="noreferrer" target="_blank">
            Ethereum Attestation Service
          </a>{" "}
          (EAS) to execute recipes and generate attestations.
        </p>
        <p>
          This demo provides a few prebuilt recipes to get you started. Future
          versions will allow you to create and share your own recipes!
        </p>
        <RecipesList />
      </Section>
      <Section>
        <RunHistory />
      </Section>
    </>
  );
}
