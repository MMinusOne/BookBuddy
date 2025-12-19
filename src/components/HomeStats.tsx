import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FaBook,
  FaClock,
  FaCalendarDay,
  FaChartLine,
  FaRunning,
} from "react-icons/fa";
import getDaisyUiColor from "../utils/daisyui";
import { FaBookOpen, FaGauge } from "react-icons/fa6";

// Mock data for the week
const weeklyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.1 },
  { day: "Fri", hours: 4.5 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 3.8 },
];

// Mock statistics
const stats = {
  totalTimeSpent: "22.1",
  booksRead: "12",
  mostActiveDay: "Saturday",
  averageDailyHours: "3.2",
  weeklyGoal: "25",
  completionRate: "88",
};

export default function HomeStats() {
  const primaryColor = getDaisyUiColor("--color-primary");
  const maxHours = Math.max(...weeklyData.map((d) => d.hours));

  /**
   * Time spent reading - this week
   * Books Read - Total this month
   * Most active day - hours on
   * Average daily - per day this week
   */
  return (
    <div className="bg-base-300 p-6 w-full h-full">
      <div className="flex lg:flex-row flex-col gap-6 h-full">
        <div className="w-[40%] flex flex-col justify-center">
          <span className="font-bold text-2xl m-4">Activity Overview</span>
          <div className="flex flex-row">
            <div className="stat shadow-lg">
              <div className="stat-figure text-primary">
                <FaClock />
              </div>
              <div className="stat-title">time spent reading</div>
              <div className="stat-value">10h</div>
              <div className="stat-desc">this week</div>
            </div>
            <div className="stat shadow-lg">
              <div className="stat-figure text-primary">
                <FaBookOpen />
              </div>
              <div className="stat-title">books read</div>
              <div className="stat-value">5</div>
              <div className="stat-desc">this month</div>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="stat shadow-lg">
              <div className="stat-figure text-primary">
                <FaRunning />
              </div>
              <div className="stat-title">most active day</div>
              <div className="stat-value">10h</div>
              <div className="stat-desc">thursday 12/12/2025</div>
            </div>
            <div className="stat shadow-lg">
              <div className="stat-figure text-primary">
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
                  fill={primaryColor}
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
