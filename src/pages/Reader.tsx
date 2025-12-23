import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Document, Page, pdfjs } from "react-pdf";
import usePage from "../lib/state/pageState";
import { convertFileSrc } from "@tauri-apps/api/core";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Reader() {
  const page = usePage();

  if (!page.currentBook) {
    return <></>;
  }

  return (
    <>
      <div className="w-full h-full">
        <Document file={convertFileSrc(page.currentBook?.book_path)}>
          <Page pageIndex={10} />
        </Document>
      </div>
    </>
  );
}
