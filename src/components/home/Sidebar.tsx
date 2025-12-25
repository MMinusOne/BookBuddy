import { open } from "@tauri-apps/plugin-dialog";
import {
  FaBook,
  FaChartLine,
  FaCheck,
  FaClock,
  FaHome,
  FaStar,
} from "react-icons/fa";
import { FaFolder } from "react-icons/fa6";
import usePage, { Page } from "../../lib/state/pageState";
import { loadBookPaths } from "../../lib/services/loadBookPaths";

export default function Sidebar() {
  const { page, setPage } = usePage();

  const handleLoadDirectory = async () => {
    const bookPaths = await open({
      directory: false,
      multiple: true,
      title: "Choose book files",
      filters: [
        {
          name: "Book Extensions",
          extensions: ["PDF"],
        },
      ],
      recursive: true,
    });

    if (!bookPaths) return;

    await loadBookPaths({ bookPaths });

    window.location.reload();
  };

  const selectedStyle = (p: Page) => {
    return page == p
      ? { backgroundColor: "rgba(255, 255, 255, 0.1)" }
      : undefined;
  };

  return (
    <>
      <div className="h-full w-65 bg-base-300">
        <div className="w-full h-20 flex items-center justify-center">
          <span className="capitalize font-bold text-center text-xl m-2 p-2">
            Book Buddy
          </span>
        </div>

        <div className="flex flex-col m-2 p-2">
          <button
            onClick={handleLoadDirectory}
            className="btn btn-outline btn-primary"
          >
            <FaFolder />
            Load Books
          </button>
        </div>

        <ul className="menu menu-md rounded-box w-full items-center *:*:opacity-70 *:*:text-[15px] *:*:p-2 *:w-full *:*:mx-4">
          <li>
            <a
              onClick={() => setPage(Page.Home)}
              style={selectedStyle(Page.Home)}
            >
              <FaHome /> Home
            </a>
          </li>
          <li>
            <a
              onClick={() => setPage(Page.CurrentBooks)}
              style={selectedStyle(Page.CurrentBooks)}
            >
              <FaBook /> Current Books
            </a>
          </li>
          <li>
            <a
              onClick={() => setPage(Page.CompletedBooks)}
              style={selectedStyle(Page.CompletedBooks)}
            >
              <FaCheck /> Completed Books
            </a>
          </li>
          <li>
            <a
              onClick={() => setPage(Page.PendingBooks)}
              style={selectedStyle(Page.PendingBooks)}
            >
              <FaClock /> Pending Books
            </a>
          </li>
          <li>
            <a
              onClick={() => setPage(Page.FavouriteBooks)}
              style={selectedStyle(Page.FavouriteBooks)}
            >
              <FaStar /> Favourite Books
            </a>
          </li>
          <li>
            <a
              onClick={() => setPage(Page.BookStatistics)}
              style={selectedStyle(Page.BookStatistics)}
            >
              <FaChartLine /> Book Statistics
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
