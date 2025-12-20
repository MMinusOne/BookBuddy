import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { FaClock, FaChartLine, FaRunning } from "react-icons/fa";
import { FaBookOpen, FaGauge } from "react-icons/fa6";

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
  return (
    <>
      <div className="p-2">
        <div
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
          className="gap-4 grid grid-auto-fit"
        >
          <BookCard />
          <BookCard />
          <BookCard />
          <BookCard />
          <BookCard />
          <BookCard />
          <BookCard />
        </div>
      </div>
    </>
  );
}

function BookCard() {
  return (
    <>
      <div className="bg-base-100 shadow-sm w-60 card">
        <figure>
          <img
            src="https:img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
        </figure>
        <div className="card-body">
          <h2 className="card-title">Card Title</h2>
          <p>
            A card component has a figure, a body part, and inside body there
            are title and actions parts
          </p>
          <div className="justify-end card-actions">
            <button className="btn btn-primary">Buy Now</button>
          </div>
        </div>
      </div>
    </>
  );
}
