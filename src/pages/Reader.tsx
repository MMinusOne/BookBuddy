import Header from "../components/Header";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useReaderState } from "../lib/state/readerState";
import DocumentView from "../components/reader-view/DocumentView";
import Sidebar from "../components/reader-view/Sidebar";
import { pdfjs } from "react-pdf";
import { useEffect, useRef } from "react";
import usePage from "../lib/state/pageState";
import { morphBook } from "../lib/services/morphBook";
import { Book, BookData } from "../lib/Book";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ReaderView() {
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const { books, setBooks } = usePage();
  const readerState = useReaderState();

  useEffect(() => {
    console.log("Finished loading", readerState.loading);
  }, [readerState.loading]);

  useEffect(() => {
    (async () => {
      if (books.length === 0 || !readerState.bookData) return;

      const currentBook = books.find((b) => b.id === readerState.bookData!.id);
      if (currentBook?.is_open) return;

      const newBooks: BookData[] = books.map((b) => {
        if (b.id === readerState.bookData!.id) {
          return { ...b, is_open: true };
        }
        return b;
      });

      const newBook: BookData | undefined = newBooks.find(
        (b) => b.id === readerState.bookData!.id
      );

      if (newBook) {
        setBooks(newBooks);
        readerState.setBookData(newBook);
        console.log("useEffect");
        await morphBook({ newBook });
      }
    })();
  }, [books, readerState.bookData?.id, setBooks, readerState.setBookData]);

  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Header />

        <div className="flex w-full h-full overflow-hidden">
          <div
            ref={documentContainerRef}
            style={{
              overflowY: "scroll",
              // overflowY: !readerState.loading ? "scroll" : "hidden",
              // display: readerState.loading ? "hidden" : undefined,
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
