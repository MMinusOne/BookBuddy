import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  FaBookOpen,
  FaEllipsis,
  FaPen,
  FaStar,
  FaTrash,
} from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { useGetBooks } from "../lib/services/getBooks";
import { Book } from "../lib/Book";
import { convertFileSrc } from "@tauri-apps/api/core";
import { deleteBook } from "../lib/services/removeBook";
import usePage, { Page } from "../lib/state/pageState";
import HomeStats from "../components/HomeStats";

export default function Home() {
  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Header />
        <div className="flex flex-row flex-1 w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 gap-4 p-4 w-full overflow-hidden overflow-y-auto">
            <section className="shrink-0">
              <div className="h-65 lg:h-80">
                <HomeStats />
              </div>
            </section>

            <section className="flex-1">
              <BookList />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function BookList() {
  const books = useGetBooks();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-2">
          <div>
            <h2 className="font-semibold text-2xl">Library</h2>
            <p className="text-sm text-base-content/70">
              All of your saved books at a glance.
            </p>
          </div>
          {books.length > 0 && (
            <span className="badge-outline text-xs badge">
              {books.length} {books.length === 1 ? "book" : "books"}
            </span>
          )}
        </div>

        <div
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
          }}
          className="gap-5 grid"
        >
          {books.length != 0 ? (
            books
              .sort((a, b) => b.progress - a.progress)
              .map((book) => <BookCard book={book} />)
          ) : (
            <div className="flex flex-col justify-center items-center gap-2 bg-base-200/40 p-10 border border-base-300/70 border-dashed rounded-2xl text-center">
              <div className="flex justify-center items-center bg-base-100 shadow-sm rounded-full w-12 h-12">
                <FaBookOpen className="text-primary" />
              </div>
              <h3 className="font-semibold text-xl">No books yet</h3>
              <p className="max-w-sm text-sm text-base-content/70">
                Start building your reading list by adding your first book. Your
                collection and stats will show up here.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BookCard({ book }: { book: Book }) {
  const imageSource = convertFileSrc(book.thumbnail_path);
  const { setCurrentBook, setPage } = usePage();

  return (
    <>
      <div className="bg-base-100 shadow-lg w-50 card">
        <div className="card-body">
          <BookMenuButton book={book} />

          <img
            src={imageSource}
            alt="Book Cover"
            className="shadow-2xl rounded-2xl h-50"
          />

          <h3 className="truncate card-title">{book.name}</h3>
          <div className="flex items-center gap-2 px-2">
            <progress
              className="progress progress-primary"
              value={book.progress}
              max={100}
            />
            <div className="flex items-center gap-2">
              <span>{book.progress}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center gap-2">
              <span className="font-semibold">
                {book.current_page}/{book.page_count}
              </span>
              <FaBookOpen />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setCurrentBook(book);
                setPage(Page.Reader);
              }}
            >
              Read
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function BookMenuButton({ book }: { book: Book }) {
  const handleDeleteBook = async () => {
    await deleteBook(book.id);
    window.location.reload();
  };

  return (
    <div className="flex justify-end items-center w-full">
      <button
        popoverTarget={`book-options-popover-${book.id}`}
        className="btn btn-square btn-sm btn-ghost"
        style={{ anchorName: `--book-options-anchor-${book.id}` }}
      >
        <FaEllipsis />
      </button>
      <ul
        className="bg-base-100 shadow-sm rounded-box w-52 dropdown menu"
        popover="auto"
        id={`book-options-popover-${book.id}`}
        style={{ positionAnchor: `--book-options-anchor-${book.id}` }}
      >
        <li>
          <a>
            <FaPen /> Rename
          </a>
        </li>
        <li>
          <a>
            <FaStar /> Set Favourite
          </a>
        </li>
        <li>
          <a>
            <FaCheck /> Mark Completed
          </a>
        </li>
        <li>
          <a onClick={handleDeleteBook}>
            <FaTrash /> Delete
          </a>
        </li>
      </ul>
    </div>
  );
}
