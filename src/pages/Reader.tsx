import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import usePage from "../lib/state/pageState";
import { convertFileSrc } from "@tauri-apps/api/core";
import Header from "../components/Header";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { FaSearchPlus, FaSearchMinus } from "react-icons/fa";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Reader() {
  const { currentBook } = usePage();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pagesWrapperRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!currentBook) return;
    const startPage = currentBook.current_page || 1;
    setCurrentPage(startPage < 1 ? 1 : startPage);
  }, [currentBook]);

  useEffect(() => {
    if (!pagesWrapperRef.current || !scrollContainerRef.current) return;

    const updateWidth = () => {
      if (!pagesWrapperRef.current || !scrollContainerRef.current) return;
      const containerWidth = scrollContainerRef.current.clientWidth;
      const desiredWidth = Math.min(containerWidth - 64, 900); // padding and max width
      setPageWidth(desiredWidth * zoom);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(scrollContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [zoom]);

  const onDocumentLoadSuccess = (pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error(err);
    setError("We couldn't open this PDF. Please try again.");
    setIsLoading(false);
  };

  const handleZoomChange = (direction: "in" | "out" | "reset") => {
    if (direction === "reset") {
      setZoom(1);
      return;
    }

    setZoom((prev) => {
      const next = direction === "in" ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(next, 0.6), 2);
    });
  };

  const progressPercent = useMemo(() => {
    if (!numPages || numPages === 0) return 0;
    return Math.round((currentPage / numPages) * 100);
  }, [currentPage, numPages]);

  const scrollToPage = (pageNumber: number) => {
    if (!scrollContainerRef.current || !pageRefs.current) return;

    const pageIndex = pageNumber - 1;
    const pageElement = pageRefs.current[pageIndex];

    if (pageElement && scrollContainerRef.current) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (!numPages) return;
    const clampedPage = Math.max(1, Math.min(newPage, numPages));
    setCurrentPage(clampedPage);
    scrollToPage(clampedPage);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (numPages && currentPage < numPages) {
      handlePageChange(currentPage + 1);
    }
  };

  if (!currentBook) {
    return null;
  }

  return (
    <div className="flex flex-col bg-base-200 w-full h-full">
      <Header />

      <div className="flex flex-row flex-1 w-full overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="flex-1 bg-base-100 shadow-inner border-base-300/70 border-r overflow-x-hidden overflow-y-auto"
        >
          <div
            ref={pagesWrapperRef}
            className="flex justify-center px-4 py-6 w-full"
          >
            <Document
              className="flex flex-col items-center gap-6 w-full max-w-5xl"
              file={convertFileSrc(currentBook.book_path)}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col justify-center items-center h-64 text-base-content/70">
                  <span className="mb-3 loading loading-spinner loading-lg" />
                  <p className="text-sm">Loading book...</p>
                </div>
              }
              error={
                <div className="flex flex-col justify-center items-center h-64 text-error">
                  <p className="mb-1 font-semibold">Something went wrong</p>
                  <p className="opacity-80 text-sm">Couldn't load PDF</p>
                </div>
              }
            >
              {error && (
                <div className="max-w-md alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              {isLoading && !error && (
                <div className="flex flex-col justify-center items-center h-64 text-base-content/70">
                  <span className="mb-3 loading loading-spinner loading-lg" />
                  <p className="text-sm">Preparing pages...</p>
                </div>
              )}

              {!isLoading &&
                !error &&
                numPages &&
                Array.from(new Array(numPages), (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <div
                      key={`page_${pageNumber}`}
                      ref={(el) => {
                        pageRefs.current[index] = el;
                      }}
                      data-page-number={pageNumber}
                      className="relative bg-base-100 shadow-xl border border-base-300/70 rounded-2xl overflow-hidden"
                    >
                      <div className="top-2 right-3 z-10 absolute bg-base-100/80 shadow px-2 py-1 rounded-full font-medium text-[10px] text-base-content/70">
                        Page {pageNumber}
                      </div>
                      <Page
                        pageNumber={pageNumber}
                        width={pageWidth}
                        renderTextLayer={false}
                      />
                    </div>
                  );
                })}
            </Document>
          </div>
        </div>

        <div className="flex flex-col bg-base-200 border-base-300/70 border-l w-72 overflow-y-auto">
          <div className="flex flex-col gap-4 p-4">
            <div className="bg-base-100 shadow-sm p-4 border border-base-300/70 rounded-xl">
              <p className="mb-1 text-xs text-base-content/60 uppercase tracking-wide">
                Reading
              </p>
              <h1 className="font-semibold text-lg truncate">
                {currentBook.name}
              </h1>
            </div>

            <div className="bg-base-100 shadow-sm p-4 border border-base-300/70 rounded-xl">
              <h2 className="mb-3 font-semibold text-sm text-base-content/80">
                Page Navigation
              </h2>

              <div className="flex items-center gap-2 mb-3">
                <button
                  className="flex-1 btn btn-sm btn-ghost"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1 || !numPages}
                >
                  <FaChevronLeft />
                  Previous
                </button>
                <button
                  className="flex-1 btn btn-sm btn-ghost"
                  onClick={handleNextPage}
                  disabled={!numPages || currentPage >= numPages}
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-base-content/70 shrink-0">
                  Page
                </span>
                <input
                  type="number"
                  min={1}
                  max={numPages ?? 1}
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="w-20 text-center input input-sm input-bordered"
                  disabled={!numPages}
                />
                <span className="text-xs text-base-content/70 shrink-0">
                  of {numPages ?? "—"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-base-content/70 shrink-0">
                  Progress
                </span>
                <span className="ml-auto font-semibold text-sm">
                  {progressPercent}%
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={numPages ?? 1}
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="range range-xs range-primary"
                disabled={!numPages}
              />
            </div>

            {/* Zoom Controls */}
            <div className="bg-base-100 shadow-sm p-4 border border-base-300/70 rounded-xl">
              <h2 className="mb-3 font-semibold text-sm text-base-content/80">
                Zoom
              </h2>

              <div className="flex items-center gap-2 mb-3">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleZoomChange("out")}
                  disabled={zoom <= 0.6}
                >
                  <FaSearchMinus />
                </button>
                <div className="flex-1 text-center">
                  <span className="font-semibold text-sm">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleZoomChange("in")}
                  disabled={zoom >= 2}
                >
                  <FaSearchPlus />
                </button>
              </div>

              <button
                className="btn-outline w-full btn btn-sm"
                onClick={() => handleZoomChange("reset")}
              >
                Reset to Fit
              </button>
            </div>

            {numPages && (
              <div className="bg-base-100 shadow-sm p-4 border border-base-300/70 rounded-xl">
                <h2 className="mb-3 font-semibold text-sm text-base-content/80">
                  Reading Stats
                </h2>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Pages Read</span>
                    <span className="font-semibold">{currentPage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">
                      Pages Remaining
                    </span>
                    <span className="font-semibold">
                      {numPages - currentPage}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Total Pages</span>
                    <span className="font-semibold">{numPages}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
