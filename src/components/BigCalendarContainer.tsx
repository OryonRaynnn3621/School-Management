import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
// XÓA DÒNG NÀY: import { adjustScheduleToCurrentWeek } from "@/lib/utils"; 

// Import BigCalendar as CLIENT component
const BigCalendar = dynamic(() => import("./BigCalender"), { ssr: false });

const BigCalendarContainer = async ({
    type,
    id,
}: {
    type: "teacherId" | "classId";
    id: string | number;
}) => {
    const dataRes = await prisma.lesson.findMany({
        where: {
            ...(type === "teacherId"
                ? { teacherId: id as string }
                : { classId: id as number }),
        },
    });

    // Giữ nguyên dữ liệu gốc, không qua hàm adjustScheduleToCurrentWeek
    const data = dataRes.map((lesson) => ({
        title: lesson.name,
        start: lesson.startTime,
        end: lesson.endTime,
    }));

    // BỎ DÒNG NÀY: const schedule = adjustScheduleToCurrentWeek(data);

    return (
        <div className="">
            {/* Truyền trực tiếp data vào lịch */}
            <BigCalendar data={data} />
        </div>
    );
};

export default BigCalendarContainer;