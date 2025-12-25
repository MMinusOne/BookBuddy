import { RefObject, useEffect } from "react";
import { useReaderState } from "../../lib/state/readerState";

export default function usePageObserver(
  callback: (pageNumber: number) => void,
  pageRefs: RefObject<(HTMLDivElement | null)[]>
) {
  const { loading, bookData } = useReaderState();

  useEffect(() => {
    if (loading || pageRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const pageNumber = parseInt(
            entry.target.getAttribute("data-page") || "0"
          );
          if (entry.isIntersecting) {
            callback(pageNumber);
          }
        }
      },
      { root: null, threshold: 0 }
    );
    pageRefs.current.forEach((pageRef) => {
      if (pageRef) observer.observe(pageRef);
    });
    return () => observer.disconnect();
  }, [loading, bookData, pageRefs]);
}
