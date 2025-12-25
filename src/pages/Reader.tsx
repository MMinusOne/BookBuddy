import { convertFileSrc } from "@tauri-apps/api/core";
import Header from "../components/Header";
import { Document, Page, pdfjs } from "react-pdf";
import usePage from "../lib/state/pageState";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useCallback, useEffect, useRef, useState } from "react";
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

  const [visiblePages, setVisiblePages] = useState(
    new Set([currentBook.current_page + 1])
  );
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

          setVisiblePages((prev) => {
            const newSet = new Set(prev);
            if (entry.isIntersecting) {
              [0, -1, +1].forEach((offset) => newSet.add(pageNumber + offset));
              setReaderState((prev) => {
                const newBookData = new Book(prev.bookData);
                newBookData.setCurrentPage(pageNumber);
                return { ...prev, bookData: newBookData };
              });
            } else {
              newSet.delete(pageNumber);
            }

            return newSet;
          });
        }
      },
      { root: null, rootMargin: "500px", threshold: 0 }
    );

    pageRefs.current.forEach((pageRef) => {
      if (pageRef) observer.observe(pageRef);
    });
    const currentPage = pageRefs.current[currentBook.current_page];

    if (documentContainerRef.current && currentPage) {
      const pageRect = currentPage.getBoundingClientRect();

      const containerRect =
        documentContainerRef.current.getBoundingClientRect();

      const scrollTop =
        pageRect.top -
        containerRect.top +
        documentContainerRef.current.scrollTop;

      documentContainerRef.current.scrollTo({
        behavior: "instant",
        top: scrollTop,
      });
    }

    return () => observer.disconnect();
  }, [isLoading]);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  useEffect(() => {
    (async () => {
      morphBook({ newBook: readerState.bookData });
    })();
  }, [readerState.bookData]);

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <Header />

        <div className="flex w-full h-full overflow-hidden">
          <div
            ref={documentContainerRef}
            className="w-full h-full flex flex-col items-center justify-start overflow-hidden overflow-y-scroll"
          >
            <div ref={pdfRef} style={{ userSelect: "text" }}>
              <Document
                className="w-fit flex flex-col gap-2"
                onLoadSuccess={() => {
                  setIsLoading(false);
                }}
                file={convertFileSrc(currentBook?.book_path)}
              >
                {new Array(currentBook.page_count)
                  .fill(0)
                  .map((_, pageIndex) => {
                    const pageNumber = pageIndex + 1;
                    const shouldRender = visiblePages.has(pageNumber);

                    return (
                      <div
                        key={pageIndex}
                        ref={setPageRef(pageIndex)}
                        data-page={pageNumber}
                        style={{ minHeight: shouldRender ? "auto" : "1100px" }}
                      >
                        {shouldRender ? (
                          <Page
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={800}
                            pageIndex={pageIndex}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="badge">Page {pageNumber}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </Document>
            </div>
          </div>
          <div className="h-full w-12.5 bg-base-300 flex p-1 flex-col items-center justify-between">
            <div className="my-2 flex items-center flex-col">
              <button className="w-full btn aspect-square">
                <FaRobot />
              </button>
            </div>

            <div className="my-2 flex items-center flex-col">
              <span className="flex items-center justify-center aspect-square w-full text-sm">
                {readerState.bookData.current_page}
              </span>

              <span className="flex items-center justify-center aspect-square w-full text-sm">
                {readerState.bookData.page_count}
              </span>

              <button className="btn aspect-square">
                <FaArrowUp />
              </button>

              <span className="flex items-center justify-center aspect-square w-full text-sm">
                {readerState.zoom}%
              </span>

              <button className="btn aspect-square">
                <FaMagnifyingGlassPlus />
              </button>

              <button className=" btn btn-ghost aspect-square">
                <FaMagnifyingGlassMinus />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
