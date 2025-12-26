import { FaRobot } from "react-icons/fa";
import { useReaderState } from "../../lib/state/readerState";
import { FaMagnifyingGlassMinus, FaMagnifyingGlassPlus } from "react-icons/fa6";
export default function Sidebar() {
  const readerState = useReaderState();

  if (!readerState.bookData) {
    return <></>;
  }

  return (
    <div className="flex flex-col justify-between items-center bg-base-300 p-1 w-12.5 h-full">
      <div className="flex flex-col items-center my-2">
        <button className="w-full aspect-square btn btn-ghost">
          <FaRobot />
        </button>
      </div>

      <div className="flex flex-col items-center my-2">
        <span className="flex justify-center items-center w-full aspect-square text-sm">
          {readerState.bookData.current_page}
        </span>

        <span className="flex justify-center items-center w-full aspect-square text-sm">
          {readerState.bookData.page_count}
        </span>

        <span className="flex justify-center items-center w-full aspect-square text-sm">
          {readerState.zoom}%
        </span>

        <button
          onClick={() => {
            readerState.setZoom(readerState.zoom + 10);
          }}
          className="aspect-square btn btn-ghost"
        >
          <FaMagnifyingGlassPlus />
        </button>

        <button
          onClick={() => {
            readerState.setZoom(readerState.zoom - 10);
          }}
          className="aspect-square btn btn-ghost"
        >
          <FaMagnifyingGlassMinus />
        </button>
      </div>
    </div>
  );
}
