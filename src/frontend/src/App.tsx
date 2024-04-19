import Header from "./components/header/Header";
import MainView from "./views/main/MainView";
import RecipeSelectedView from "./views/recipe-selected/RecipeSelectedView";
import { useActor } from "./ic/Actors";
import useRunContext from "./ run-context/useRunContext";

function App() {
  const { actor } = useActor();
  const { selectedRecipe } = useRunContext();

  if (!actor) {
    return <p>LOADING</p>;
  }

  return (
    <div className="flex flex-col items-center w-full">
      <Header />
      <div className="flex flex-col items-center gap-10 p-5">
        <div className="h-5 md:h-10" />
        {selectedRecipe ? <RecipeSelectedView /> : <MainView />}
      </div>
    </div>
  );
}

export default App;
