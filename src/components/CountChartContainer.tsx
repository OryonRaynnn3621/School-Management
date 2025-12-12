import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";

const CountChartContainer = async () => {
    const data = await prisma.student.groupBy({
        by: ["sex"],
        _count: true,
    });

    const boys = data.find((d) => d.sex === "MALE")?._count || 0;
    const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;
    const total = boys + girls || 1; // Tránh chia cho 0

    return (
        <div className="bg-white rounded-xl w-full h-full p-4 shadow-md border border-gray-100 flex flex-col justify-between">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-bold text-gray-800">Học sinh</h1>
                <Image src="/moreDark.png" alt="" width={20} height={20} className="cursor-pointer opacity-60 hover:opacity-100" />
            </div>

            {/* --- CHART (Chiếm phần lớn diện tích) --- */}
            <div className="w-full h-[70%] relative">
                <CountChart boys={boys} girls={girls} />
            </div>

            {/* --- FOOTER LEGEND (Căn giữa đẹp) --- */}
            <div className="flex justify-center gap-16">

                {/* Nam */}
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-lamaSky rounded-full shadow-sm" />
                    <h1 className="font-bold text-gray-700">{boys}</h1>
                    <h2 className="text-xs text-gray-400 font-medium">
                        Nam ({Math.round((boys / total) * 100)}%)
                    </h2>
                </div>

                {/* Nữ */}
                <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 bg-lamaYellow rounded-full shadow-sm" />
                    <h1 className="font-bold text-gray-700">{girls}</h1>
                    <h2 className="text-xs text-gray-400 font-medium">
                        Nữ ({Math.round((girls / total) * 100)}%)
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default CountChartContainer;