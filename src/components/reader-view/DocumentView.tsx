import { convertFileSrc } from "@tauri-apps/api/core";
import { Document, Page } from "react-pdf";
import { useReaderState } from "../../lib/state/readerState";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import usePageObserver from "../hooks/usePageObserver";
import { morphBook } from "../../lib/services/morphBook";
import usePage from "../../lib/state/pageState";

export default function DocumentView({
  documentContainerRef,
}: {
  documentContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const readerState = useReaderState();
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [numPagesLoaded, setNumPagesLoaded] = useState(0);
  const [initiallyScrolled, setInitiallyScrolled] = useState(false);

  const allPagesLoaded = useMemo(() => {
    if (!readerState.bookData) return false;

    return (
      readerState.bookData.page_count > 0 &&
      numPagesLoaded == readerState.bookData.page_count
    );
  }, [numPagesLoaded, readerState.bookData?.page_count]);

  const setPageRef = useCallback(
    (pageIndex: number) => (el: HTMLDivElement | null) => {
      pageRefs.current[pageIndex] = el;
    },
    []
  );

  useEffect(() => {
    readerState.setLoading(!allPagesLoaded);
  }, [allPagesLoaded]);

  usePageObserver(async (pageNumber) => {
    readerState.setBookCurrentPage(pageNumber);
  }, pageRefs);

  useEffect(() => {
    if (initiallyScrolled) return;
    console.log(readerState.loading, documentContainerRef);
    if (readerState.loading) return;
    if (!documentContainerRef) return;
    const page = pageRefs.current[readerState.bookData?.current_page! - 1];

    if (!page) return;

    const pageRect = page?.getBoundingClientRect();

    documentContainerRef.current?.scrollTo(0, pageRect.bottom);
    setInitiallyScrolled(true);
  }, [readerState.loading, documentContainerRef, pageRefs, initiallyScrolled]);

  if (!readerState.bookData) {
    return <></>;
  }

  return (
    <Document
      className="flex flex-col gap-2 w-fit"
      loading={<>Loading</>}
      file={convertFileSrc(readerState.bookData?.book_path)}
    >
      {new Array(readerState.bookData.page_count)
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
                data-page={pageIndex + 1}
                onRenderSuccess={() => {
                  setNumPagesLoaded((prev) => prev + 1);
                }}
              />
            </div>
          );
        })}
    </Document>
  );
}
