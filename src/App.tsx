import "./globals.css";
import Home from "./pages/Home";
import usePage, { Page } from "./lib/state/pageState";

function App() {
  const { page } = usePage();

  return (
    <>
      <main className="w-full h-full">
        {page == Page.Home ? <Home /> : null}
      </main>
    </>
  );
}

export default App;
