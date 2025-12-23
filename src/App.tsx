import "./globals.css";
import Home from "./pages/Home";
import usePage, { Page } from "./lib/state/pageState";
import Reader from "./pages/Reader";

function App() {
  const { page } = usePage();

  return (
    <>
      <main className="w-full h-full">
        {page == Page.Home ? <Home /> : page == Page.Reader ? <Reader /> : null}
      </main>
    </>
  );
}

export default App;
