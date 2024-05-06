import GitHubIcon from "./components/GitHubIcon";
import Header from "./components/header/Header";
import MainView from "./views/main/MainView";
import RecipeSelectedView from "./views/recipe-selected/RecipeSelectedView";
import useRunContext from "./context/useRunContext";
import SearchSection from "./components/search/SearchSection";
import { useAtomValue } from "jotai";
import { routeAtom } from "./state";
import HistoryView from "./views/history/HistoryView";

function App() {
  const { selectedRecipe } = useRunContext();
  const route = useAtomValue(routeAtom);
  return (
    <div className="flex flex-col items-center w-full pb-10">
      <Header />
      <SearchSection />
      <div className="flex flex-col items-center gap-10 p-5 pt-10">
        {route === "history" ? (
          <HistoryView />
        ) : selectedRecipe ? (
          <RecipeSelectedView />
        ) : (
          <MainView />
        )}
        <GitHubIcon />
      </div>
    </div>
  );
}

export default App;
