import { FaBook, FaChartLine, FaCheck, FaClock, FaStar } from "react-icons/fa";
import { FaFolder } from "react-icons/fa6";

export default function Sidebar() {
  return (
    <>
      <div className="h-full w-65 bg-base-300">
        <div className="w-full h-20 flex items-center justify-center">
          <span className="capitalize font-bold text-center text-xl m-2 p-2">
            Book Buddy
          </span>
        </div>

        <div className="flex flex-col m-2 p-2">
          <button className="btn btn-outline btn-primary">
            <FaFolder />
            Load Directory
          </button>
        </div>

        <ul className="menu menu-md rounded-box w-full items-center *:*:opacity-70 *:*:text-[15px] *:*:p-2 *:w-full *:*:mx-4">
          <li>
            <a>
              <FaBook /> Current Books
            </a>
          </li>
          <li>
            <a>
              <FaCheck /> Completed Books
            </a>
          </li>
          <li>
            <a>
              <FaClock /> Pending Books
            </a>
          </li>
          <li>
            <a>
              <FaStar /> Favourite Books
            </a>
          </li>
          <li>
            <a>
              <FaChartLine /> Book Statistics
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
