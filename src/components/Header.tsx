import { FaHome, FaPlus } from "react-icons/fa";
import { FaGear, FaList } from "react-icons/fa6";

export default function Header() {
  return (
    <>
      <div className="w-full h-12.5 bg-base-300 flex items-center p-4">
        <div className="flex gap-3">
          <button className="btn btn-square">
            <FaList />
          </button>
          <button className="btn btn-square">
            <FaHome />
          </button>
          <div className="divider divider-horizontal mx-2"></div>
          <button className="btn btn-square">
            <FaPlus />
          </button>
        </div>

        <div className="ml-auto">
          <button className="btn btn-square">
            <FaGear />
          </button>
        </div>
      </div>
    </>
  );
}
