import { invoke } from "@tauri-apps/api/core";
import "./globals.css";
import { useState } from "react";
import Home from "./pages/Home";
import usePage, { Page } from "./lib/pageState";

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
