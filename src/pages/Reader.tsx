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

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ReaderView() {
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const { books, setBooks } = usePage();
  const readerState = useReaderState();

  useEffect(() => {
    (async () => {
      if (books.length == 0) return;
      console.log(books);

      const newBooks = [];
      let newBook;

      for (const b of books) {
        if (b.id == readerState.bookData!.id) {
          b.is_open = true;
          newBooks.push(b);
          newBook = b;
        } else {
          newBooks.push(b);
        }
      }
      setBooks(books);
      if (newBook) readerState.setBookData(newBook);
      await morphBook({ newBook: newBook! });
    })();
  }, [books]);

  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Header />

        <div className="flex w-full h-full overflow-hidden">
          <div
            ref={documentContainerRef}
            style={{
              overflowY: !readerState.loading ? "scroll" : "hidden",
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
