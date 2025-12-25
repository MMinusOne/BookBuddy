import { convertFileSrc } from "@tauri-apps/api/core";
import Header from "../components/Header";
import { Document, Page, pdfjs } from "react-pdf";
import usePage from "../lib/state/pageState";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Book } from "../lib/Book";
import { morphBook } from "../lib/services/morphBook";
import { FaArrowDown, FaArrowUp, FaRobot } from "react-icons/fa";
import { FaMagnifyingGlassMinus, FaMagnifyingGlassPlus } from "react-icons/fa6";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ReaderView() {
  const { currentBook, setIsLoading, isLoading } = usePage();

  if (!currentBook) {
    return <></>;
  }

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const documentContainerRef = useRef<HTMLDivElement>(null);
  const [readerState, setReaderState] = useState<{
    zoom: number;
    startTime: Date;
    selectedText: string;
    bookData: Book;
  }>({
    zoom: 100,
    startTime: new Date(),
    selectedText: "",
    bookData: currentBook,
  });
  const pdfRef = useRef<HTMLDivElement>(null);
  const [numPagesLoaded, setNumPagesLoaded] = useState(0);
  const allPagesLoaded = useMemo(() => {
    return (
      currentBook.page_count > 0 && numPagesLoaded == currentBook.page_count
    );
  }, [numPagesLoaded, currentBook.page_count]);

  const setPageRef = useCallback(
    (pageIndex: number) => (el: HTMLDivElement | null) => {
      pageRefs.current[pageIndex] = el;
    },
    []
  );

  useEffect(() => {
    if (!pdfRef.current) return;

    pdfRef.current.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      if (!selection) return;
      const text = selection.toString();
      // Not implemented
    });
  }, [pdfRef]);

  useEffect(() => {
    if (isLoading) return;
    if (pageRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const pageNumber = parseInt(
            entry.target.getAttribute("data-page") || "0"
          );

          if (entry.isIntersecting) {
            setReaderState((prev) => {
              const newBookData = new Book(prev.bookData);
              newBookData.setCurrentPage(pageNumber);
              return { ...prev, bookData: newBookData };
            });
          }
        }
      },
      { root: null, rootMargin: "500px", threshold: 0 }
    );
    pageRefs.current.forEach((pageRef) => {
      if (pageRef) observer.observe(pageRef);
    });

    return () => observer.disconnect();
  }, [isLoading, readerState.bookData.current_page]);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (!allPagesLoaded) return;

    const currentPageIndex = currentBook.current_page - 1;
    const currentPage = pageRefs.current[currentPageIndex];

    if (documentContainerRef.current && currentPage) {
      const pageRect = currentPage.getBoundingClientRect();
      const containerRect =
        documentContainerRef.current.getBoundingClientRect();

      const scrollTop =
        pageRect.top -
        containerRect.top +
        documentContainerRef.current.scrollTop;

      console.log(scrollTop);

      documentContainerRef.current.scrollTo({
        behavior: "instant",
        top: scrollTop,
      });
    }
  }, [isLoading, allPagesLoaded]);

  useEffect(() => {
    (async () => {
      morphBook({ newBook: readerState.bookData });
    })();
  }, [readerState.bookData]);

  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Header />

        <div className="flex w-full h-full overflow-hidden">
          <div
            ref={documentContainerRef}
            style={{
              overflowY: allPagesLoaded ? "scroll" : "hidden",
            }}
            className="flex flex-col justify-start items-center w-full h-full overflow-hidden"
          >
            <div ref={pdfRef} style={{ userSelect: "text" }}>
              <Document
                className="flex flex-col gap-2 w-fit"
                onLoadSuccess={() => {
                  setIsLoading(false);
                }}
                loading={<>Loading</>}
                file={convertFileSrc(currentBook?.book_path)}
              >
                {new Array(currentBook.page_count)
                  .fill(0)
                  .map((_, pageIndex) => {
                    const pageNumber = pageIndex + 1;

                    return (
                      <div
                        key={pageIndex}
                        ref={setPageRef(pageIndex)}
                        data-page={pageNumber}
                      >
                        <Page
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          width={800 * (readerState.zoom / 100)}
                          pageIndex={pageIndex}
                          onRenderSuccess={() => {
                            setNumPagesLoaded((prev) => prev + 1);
                          }}
                        />
                      </div>
                    );
                  })}
              </Document>
            </div>
          </div>
          <div className="flex flex-col justify-between items-center bg-base-300 p-1 w-12.5 h-full">
            <div className="flex flex-col items-center my-2">
              <button className="w-full aspect-square btn btn-ghost">
                <FaRobot />
              </button>
            </div>

            <div className="flex flex-col items-center my-2">
              <span className="flex justify-center items-center w-full aspect-square text-sm">
                {readerState.bookData.current_page}
              </span>

              <span className="flex justify-center items-center w-full aspect-square text-sm">
                {readerState.bookData.page_count}
              </span>

              <button
                onClick={() => {
                  setReaderState((prev) => {
                    const newBook = new Book(prev.bookData);
                    newBook.current_page += 1;
                    return { ...prev, bookData: newBook };
                  });
                }}
                className="aspect-square btn btn-ghost"
              >
                <FaArrowUp />
              </button>
              <button
                onClick={() => {
                  setReaderState((prev) => {
                    const newBook = new Book(prev.bookData);
                    newBook.current_page -= 1;
                    return { ...prev, bookData: newBook };
                  });
                }}
                className="aspect-square btn btn-ghost"
              >
                <FaArrowDown />
              </button>

              <span className="flex justify-center items-center w-full aspect-square text-sm">
                {readerState.zoom}%
              </span>

              <button
                onClick={() => {
                  setReaderState((prev) => ({ ...prev, zoom: prev.zoom + 10 }));
                }}
                className="aspect-square btn btn-ghost"
              >
                <FaMagnifyingGlassPlus />
              </button>

              <button
                onClick={() => {
                  setReaderState((prev) => ({ ...prev, zoom: prev.zoom - 10 }));
                }}
                className="aspect-square btn btn-ghost"
              >
                <FaMagnifyingGlassMinus />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
