import Header from "./components/header/Header";
import MainView from "./views/main/MainView";
import RecipeSelectedView from "./views/recipe-selected/RecipeSelectedView";
import useRunContext from "./ run-context/useRunContext";
import LoginSection from "./components/login/LoginSection";
import { useSiweIdentity } from "ic-use-siwe-identity";

function App() {
  const { selectedRecipe } = useRunContext();
  const { identity } = useSiweIdentity();

  return (
    <div className="flex flex-col items-center w-full">
      <Header />
      <div className="flex flex-col items-center gap-10 p-5">
        <div className="h-5 md:h-10" />
        {!identity && <LoginSection />}
        {selectedRecipe ? <RecipeSelectedView /> : <MainView />}
      </div>
    </div>
  );
}

export default App;
