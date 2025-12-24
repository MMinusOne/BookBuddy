import { convertFileSrc } from "@tauri-apps/api/core";
import Header from "../components/Header";
import { Document, Page, pdfjs } from "react-pdf";
import usePage from "../lib/state/pageState";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useEffect, useRef, useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ReaderView() {
  const { currentBook, setIsLoading } = usePage();
  const [visiblePages, setVisiblePages] = useState(new Set([1]));
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!currentBook) {
    return <></>;
  }

  const [readerState, setReaderState] = useState({
    zoom: 100,
    page: currentBook.current_page,
    startTime: new Date(),
    progress: (currentBook.current_page / currentBook.page_count) * 100,
    bookmarks: [],
    selectedText: "",
  });

  const pdfRef = useRef<HTMLDivElement>(null);

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
            } else {
              newSet.delete(pageNumber);
            }

            return newSet;
          });
        }
      },
      { root: null, rootMargin: "500px", threshold: 0 }
    );

    for (const pageRef of pageRefs.current) {
      if (pageRef) observer.observe(pageRef);
    }

    return () => observer.disconnect();
  }, [currentBook]);

  useEffect(() => {
    setIsLoading(true);
  }, []);

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <Header />

        <div className="flex w-full h-full overflow-hidden">
          <div className="w-full h-full flex flex-col items-center justify-start overflow-hidden overflow-y-scroll">
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

                    if (!pageRefs.current) return;

                    return (
                      <div
                        key={pageIndex}
                        ref={(el) => {
                          pageRefs.current[pageIndex] = el;
                        }}
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
          <div className="h-full w-12.5 bg-base-300"></div>
        </div>
      </div>
    </>
  );
}
