import Header from "../components/Header";
import HomeStats from "../components/HomeStats";
import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <>
      <div className="w-full h-full flex flex-col">
        <Header />
        <div className="flex flex-row w-full h-full">
          <Sidebar />
          <div className="flex flex-col w-full">
            <div className="w-full h-[40%] p-4 flex items-center justify-center">
              <HomeStats />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
