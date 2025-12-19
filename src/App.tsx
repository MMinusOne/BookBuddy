import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import { useState } from "react";
import Home from "./pages/Home";

enum Page {
  Home,
}

function App() {
  const [page, setPage] = useState(Page.Home);

  return (
    <>
      <main className="w-full h-full">
        {page == Page.Home ? <Home /> : null}
      </main>
    </>
  );
}

export default App;
