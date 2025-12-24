import { convertFileSrc } from "@tauri-apps/api/core";
import Header from "../components/Header";
import { Document, Page } from "react-pdf";
import usePage from "../lib/state/pageState";

export default function ReaderView() {
  const { currentBook } = usePage();

  if (!currentBook) {
    return <></>;
  }

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <Header />

        <div>
          <Document file={convertFileSrc(currentBook?.book_path)}></Document>
        </div>
      </div>
    </>
  );
}
