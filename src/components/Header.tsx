import { FaHome, FaList, FaPlus } from "react-icons/fa";
import usePage, { Page } from "../lib/state/pageState";
import { useGetBooks } from "../lib/services/getBooks";
import { FaX } from "react-icons/fa6";

export default function Header() {
  const { setPage, setCurrentBook } = usePage();
  const books = useGetBooks();

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
                <button
                  onClick={() => {
                    setCurrentBook(book);
                    setPage(Page.Reader);
                  }}
                  className="btn w-80"
                >
                  <FaX width={40} height={40} />
                  <span className="truncate w-70">{book.name}</span>
                </button>
              );
            })}
        </div>

        <div className="ml-auto"></div>
      </div>
    </>
  );
}
