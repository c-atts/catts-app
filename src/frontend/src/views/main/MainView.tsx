import RecipesList from "./components/RecipesList";
import RunHistory from "./components/RunHistory";

export default function MainView() {
  return (
    <>
      <div>
        <h2>Run a recipe</h2>
        <p>
          This is an early demo of what is possible using{" "}
          <span className="font-bold text-theme-400">C–ATTS</span>. Select from
          one of three pre-defined recipes to get started. All attestations are
          created on the Ethereum Sepolia testnet.
        </p>
      </div>
      <RecipesList />
      <RunHistory />
    </>
  );
}
