import Header from "./components/header/Header";
import MainView from "./views/main/MainView";
import RecipeSelectedView from "./views/recipe-selected/RecipeSelectedView";
import useRunContext from "./ run-context/useRunContext";
import LoginSection from "./components/login/LoginSection";
import { useSiweIdentity } from "ic-use-siwe-identity";
import GitHubIcon from "./components/GitHubIcon";

function App() {
  const { selectedRecipe } = useRunContext();
  const { identity } = useSiweIdentity();

  return (
    <div className="flex flex-col items-center w-full pb-10">
      <Header />
      <div className="flex flex-col items-center gap-10 p-5">
        {!identity && <LoginSection />}
        {selectedRecipe ? <RecipeSelectedView /> : <MainView />}
        <GitHubIcon />
      </div>
    </div>
  );
}

export default App;
