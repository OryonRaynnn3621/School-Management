import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="p-4 flex gap-6 flex-col md:flex-row">
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">

        {/* USER CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-6 flex-col lg:flex-row h-[450px]">
          {/* COUNT CHART - Chiếm 1/3 */}
          <div className="w-full lg:w-1/3 h-full">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART - Chiếm 2/3 */}
          <div className="w-full lg:w-2/3 h-full">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* BOTTOM CHARTS (Nếu bạn muốn thêm FinanceChart sau này thì đặt ở đây) */}
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <EventCalendarContainer searchParams={searchParams} />
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;