import { FaHome, FaList, FaPlus } from "react-icons/fa";
import usePage, { Page } from "../lib/state/pageState";

export default function Header() {
  const { setPage } = usePage();

  const handleHome = () => {
    setPage(Page.Home);
  };

  return (
    <>
      <div className="w-full h-12.5 bg-base-300 flex items-center p-4">
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

        <div className="ml-auto"></div>
      </div>
    </>
  );
}
