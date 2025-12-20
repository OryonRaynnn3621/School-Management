import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = await auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  console.log(classItem);
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        <div className="h-full bg-white p-4 rounded-md shadow-md border border-gray-100">
          <h1 className="text-xl font-semibold">Lịch học</h1>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
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

export default StudentPage;