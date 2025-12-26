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
  }, [allPagesLoaded, readerState.setLoading]);

  const handlePageChange = useCallback(
    (pageNumber: number) => {
      readerState.setBookCurrentPage(pageNumber);
    },
    [readerState.setBookCurrentPage]
  );

  usePageObserver(handlePageChange, pageRefs);

  useEffect(() => {
    if (initiallyScrolled) return;
    if (readerState.loading) return;
    if (!documentContainerRef?.current) return;
    if (!readerState.bookData?.current_page) return;

    const page = pageRefs.current[readerState.bookData.current_page - 1];

    if (!page) return;

    const pageRect = page.getBoundingClientRect();

    documentContainerRef.current.scrollTo(0, pageRect.bottom);
    setInitiallyScrolled(true);
  }, [
    readerState.loading,
    readerState.bookData?.current_page,
    documentContainerRef,
    initiallyScrolled,
  ]);

  if (!readerState.bookData) {
    return <></>;
  }

  const documentFile = useMemo(
    () =>
      readerState.bookData
        ? convertFileSrc(readerState.bookData.book_path)
        : null,
    [readerState.bookData?.book_path]
  );

  if (!documentFile) {
    return <></>;
  }

  return (
    <Document
      className="flex flex-col gap-2 w-fit"
      loading={<>Loading</>}
      file={documentFile}
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
