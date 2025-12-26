import { RefObject, useEffect, useRef } from "react";
import { useReaderState } from "../../lib/state/readerState";

export default function usePageObserver(
  callback: (pageNumber: number) => void,
  pageRefs: RefObject<(HTMLDivElement | null)[]>
) {
  const { loading, bookData } = useReaderState();
  const callbackRef = useRef(callback);
  const lastPageRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastBookIdRef = useRef<string | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (loading || !bookData || pageRefs.current.length === 0) {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    const currentBookId = bookData.id;

    if (lastBookIdRef.current !== currentBookId) {
      lastBookIdRef.current = currentBookId;
      lastPageRef.current = null;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        let bestPage: number | null = null;
        let bestDistance = Infinity;
        const viewportCenter = window.innerHeight / 2;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(
              entry.target.getAttribute("data-page") || "0"
            );
            if (pageNumber > 0) {
              const rect = entry.boundingClientRect;
              const pageCenter = rect.top + rect.height / 2;
              const distance = Math.abs(pageCenter - viewportCenter);

              if (distance < bestDistance) {
                bestDistance = distance;
                bestPage = pageNumber;
              }
            }
          }
        }

        
        if (bestPage !== null && bestPage !== lastPageRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (bestPage !== null && bestPage !== lastPageRef.current) {
              lastPageRef.current = bestPage;
              callbackRef.current(bestPage);
            }
          }, 150); 
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -20% 0px", 
        threshold: [0, 0.25, 0.5, 0.75, 1.0],
      }
    );

    observerRef.current = observer;

    pageRefs.current.forEach((pageRef) => {
      if (pageRef) observer.observe(pageRef);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      lastPageRef.current = null;
    };
  }, [loading, bookData?.id, bookData?.page_count]);
}
