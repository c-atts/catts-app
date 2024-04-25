import GitHubIcon from "./components/GitHubIcon";
import Header from "./components/header/Header";
import LoginSection from "./components/login/LoginSection";
import MainView from "./views/main/MainView";
import RecipeSelectedView from "./views/recipe-selected/RecipeSelectedView";
import useRunContext from "./context/useRunContext";
import { useSiweIdentity } from "ic-use-siwe-identity";

function App() {
  const { selectedRecipe } = useRunContext();
  const { identity } = useSiweIdentity();

  return (
    <div className="flex flex-col items-center w-full pb-10">
      <Header />
      <div className="flex flex-col items-center gap-10 p-5 pt-36">
        {!identity && <LoginSection />}
        {selectedRecipe ? <RecipeSelectedView /> : <MainView />}
        <GitHubIcon />
      </div>
    </div>
  );
}

export default App;
