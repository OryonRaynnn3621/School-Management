import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const AttendanceChartContainer = async () => {
    // ... (Giữ nguyên logic lấy dữ liệu Date) ...
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceMonday);

    const resData = await prisma.attendance.findMany({
        where: {
            date: {
                gte: lastMonday,
            },
        },
        select: {
            date: true,
            present: true,
        },
    });

    const daysOfWeek = ["TH2", "TH3", "TH4", "TH5", "TH6"];
    const attendanceMap: { [key: string]: { present: number; absent: number } } =
    {
        TH2: { present: 0, absent: 0 },
        TH3: { present: 0, absent: 0 },
        TH4: { present: 0, absent: 0 },
        TH5: { present: 0, absent: 0 },
        TH6: { present: 0, absent: 0 },
    };

    resData.forEach((item) => {
        const itemDate = new Date(item.date);
        const dayOfWeek = itemDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dayName = daysOfWeek[dayOfWeek - 1];
            if (item.present) {
                attendanceMap[dayName].present += 1;
            } else {
                attendanceMap[dayName].absent += 1;
            }
        }
    });

    const data = daysOfWeek.map((day) => ({
        name: day,
        present: attendanceMap[day].present,
        absent: attendanceMap[day].absent,
    }));

    return (
        <div className="bg-white rounded-xl w-full h-full p-4 shadow-md border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-bold text-gray-800">Chuyên cần (Tuần này)</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} className="cursor-pointer opacity-60 hover:opacity-100" />
            </div>
            <div className="w-full h-[90%]">
                <AttendanceChart data={data} />
            </div>
        </div>
    );
};

export default AttendanceChartContainer;