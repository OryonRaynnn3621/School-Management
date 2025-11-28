import prisma from "@/lib/prisma";
import dynamic from "next/dynamic";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

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

    const data = dataRes.map((lesson) => ({
        title: lesson.name,
        start: lesson.startTime,
        end: lesson.endTime,
    }));

    const schedule = adjustScheduleToCurrentWeek(data);

    return (
        <div>
            <BigCalendar data={schedule} />
        </div>
    );
};

export default BigCalendarContainer;
