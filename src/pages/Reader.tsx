import Header from "../components/Header";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useReaderState } from "../lib/state/readerState";
import DocumentView from "../components/reader-view/DocumentView";
import Sidebar from "../components/reader-view/Sidebar";
import { pdfjs } from "react-pdf";
import { useRef } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ReaderView() {
  const documentContainerRef = useRef<HTMLDivElement>(null);

  const { loading } = useReaderState();

  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Header />

        <div className="flex w-full h-full overflow-hidden">
          <div
            ref={documentContainerRef}
            style={{
              overflowY: !loading ? "scroll" : "hidden",
            }} 
            id="document-container"
            className="flex flex-col justify-start items-center w-full h-full overflow-hidden"
          >
            <div style={{ userSelect: "text" }}>
              <DocumentView documentContainerRef={documentContainerRef} />
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </>
  );
}
