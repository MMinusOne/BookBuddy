import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  FaClock,
  FaChartLine,
  FaRunning,
  FaPen,
  FaCheck,
} from "react-icons/fa";
import {
  FaBookOpen,
  FaEllipsis,
  FaGauge,
  FaStar,
  FaTrash,
} from "react-icons/fa6";
import { useGetBooks } from "../lib/services/getBooks";
import { Book } from "../lib/Book";
import { convertFileSrc } from "@tauri-apps/api/core";
import { deleteBook } from "../lib/services/removeBook";
import usePage, { Page } from "../lib/state/pageState";

export default function Home() {
  return (
    <>
      <div className="flex flex-col w-full h-full">
        <Header />
        <div className="flex flex-row flex-1 w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 w-full overflow-hidden overflow-y-auto">
            <div className="flex justify-center items-center p-4 w-full h-[40%] shrink-0">
              <Stats />
            </div>
            <div className="flex-1 p-4 w-full">
              <BookList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const weeklyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.1 },
  { day: "Fri", hours: 4.5 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 3.8 },
];

function Stats() {
  return (
    <div className="bg-base-300 p-6 rounded-2xl w-full h-full">
      <div className="flex lg:flex-row flex-col gap-6 h-full">
        <div className="flex flex-col justify-center w-[40%]">
          <span className="m-4 font-bold text-2xl">Activity Overview</span>
          <div className="flex flex-row">
            <div className="shadow-lg stat">
              <div className="text-primary stat-figure">
                <FaClock />
              </div>
              <div className="stat-title">time spent reading</div>
              <div className="stat-value">10h</div>
              <div className="stat-desc">this week</div>
            </div>
            <div className="shadow-lg stat">
              <div className="text-primary stat-figure">
                <FaBookOpen />
              </div>
              <div className="stat-title">books read</div>
              <div className="stat-value">5</div>
              <div className="stat-desc">this month</div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="shadow-lg stat">
              <div className="text-primary stat-figure">
                <FaRunning />
              </div>
              <div className="stat-title">most active day</div>
              <div className="stat-value">10h</div>
              <div className="stat-desc">thursday 12/12/2025</div>
            </div>
            <div className="shadow-lg stat">
              <div className="text-primary stat-figure">
                <FaGauge />
              </div>
              <div className="stat-title">average daily</div>
              <div className="stat-value">5h</div>
              <div className="stat-desc">this month</div>
            </div>
          </div>
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="flex-1 bg-base-100 shadow-lg p-6 rounded-lg">
          <h2 className="flex items-center gap-2 mb-4 font-bold text-base-content text-2xl">
            <FaChartLine className="text-primary" />
            Weekly Reading Activity
          </h2>
          <div className="h-[calc(100%-4rem)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--color-base-content)" }}
                  axisLine={{ stroke: "var(--color-base-content)" }}
                />
                <YAxis
                  tick={{ fill: "var(--color-base-content)" }}
                  axisLine={{ stroke: "var(--color-base-content)" }}
                  label={{
                    value: "Hours",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "var(--color-base-content)" },
                  }}
                />
                <Bar
                  dataKey="hours"
                  className="opacity-90 fill-primary"
                  radius={[8, 8, 0, 0]}
                  name="Hours Read"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookList() {
  const books = useGetBooks();

  return (
    <>
      <div className="p-2">
        <span className="font-semibold text-3xl">Book Collection</span>
        <div
          style={{
            gridTemplateColumns: "repeat(auto-fit, 12.5rem)",
          }}
          className="gap-4 grid grid-auto-fit p-2 justify-center"
        >
          {books.length != 0 ? (
            books
              .sort((a, b) => a.current_page - b.current_page)
              .map((book) => <BookCard book={book} />)
          ) : (
            <div className="w-full h-full">
              <span className="capitalize font-semibold text-4xl whitespace-nowrap">
                No Books Yet
              </span>
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
            className="rounded-2xl shadow-2xl h-50"
          />

          <h3 className="card-title truncate">{book.name}</h3>
          <div className="px-2 flex items-center gap-2">
            <progress
              className="progress progress-primary"
              value={(book.current_page / book.page_count) * 100}
              max={100}
            />
            <div className="flex items-center gap-2">
              <span>{(book.current_page / book.page_count) * 100}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center justify-center gap-2">
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
    <div className="w-full flex items-center justify-end">
      <button
        popoverTarget={`book-options-popover-${book.id}`}
        className="btn btn-square btn-sm btn-ghost"
        style={{ anchorName: `--book-options-anchor-${book.id}` }}
      >
        <FaEllipsis />
      </button>
      <ul
        className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm"
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
