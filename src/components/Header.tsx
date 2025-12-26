import { FaHome, FaList, FaPlus } from "react-icons/fa";
import usePage, { Page } from "../lib/state/pageState";
import { FaX } from "react-icons/fa6";
import { useReaderState } from "../lib/state/readerState";
import { morphBook } from "../lib/services/morphBook";

export default function Header() {
  const { setPage } = usePage();
  const readerState = useReaderState();
  const { books } = usePage();

  const handleHome = () => {
    setPage(Page.Home);
  };

  return (
    <>
      <div className="w-full h-12.5 bg-base-300 flex items-center p-4 gap-4">
        <div className="flex gap-3">
          <button className="btn btn-square">
            <FaList />
          </button>
          <button onClick={handleHome} className="btn btn-square">
            <FaHome />
          </button>
          <div className="divider divider-horizontal mx-2"></div>
          <button className="btn btn-square">
            <FaPlus />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 h-full my-4">
          {books
            .filter((b) => b.is_open)
            .map((book) => {
              return (
                <div className="flex items-center justify-center w-80 bg-base-200 p-1 rounded-lg my-2">
                  <button
                    onClick={async () => {
                      book!.is_open = false;
                      readerState.setBookData(book);
                      console.log(readerState.bookData);
                      setPage(Page.Home);
                      await morphBook({ newBook: book! });
                    }}
                    className="btn btn-sm btn-ghost"
                  >
                    <FaX />
                  </button>
                  <button
                    onClick={() => {
                      readerState.bookData!.is_open = true;
                      readerState.setBookData(book);
                      setPage(Page.Reader);
                    }}
                    className="btn btn-ghost"
                  >
                    <span className="w-60 truncate">{book.name}</span>
                  </button>
                </div>
              );
            })}
        </div>

        <div className="ml-auto"></div>
      </div>
    </>
  );
}
