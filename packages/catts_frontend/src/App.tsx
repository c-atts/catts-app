import GitHubIcon from "./components/GitHubIcon";
import Header from "./components/header/Header";
import MainView from "./views/main/MainView";
import RecipeSelectedView from "./views/recipe-selected/RecipeSelectedView";
import useRunContext from "./context/useRunContext";

function App() {
  const { selectedRecipe } = useRunContext();

  return (
    <div className="flex flex-col items-center w-full pb-10">
      <Header />
      <div className="flex flex-col items-center gap-10 p-5 pt-36">
        {selectedRecipe ? <RecipeSelectedView /> : <MainView />}
        <GitHubIcon />
      </div>
    </div>
  );
}

export default App;
