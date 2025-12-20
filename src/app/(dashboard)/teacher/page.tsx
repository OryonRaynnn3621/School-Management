import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { auth } from "@clerk/nextjs/server";

const TeacherPage = async () => {
  const { userId } = await auth();
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <div className="h-full bg-white p-4 rounded-md shadow-md border border-gray-100">
          <h1 className="text-xl font-semibold">Lịch dạy học</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">

        {/* 1. Khối Lịch (EventCalendar) */}
        <div className="bg-white p-2 rounded-md shadow-md border border-gray-100">
          <EventCalendar />
        </div>

        {/* 2. Khối Thông báo (Announcements) */}
        <div className="bg-white p-2 rounded-md shadow-md border border-gray-100">
          <Announcements />
        </div>

      </div>
    </div>
  );
};

export default TeacherPage;