import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { Attendance, Class, Lesson, Student, Subject } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type AttendanceList = Attendance & {
    student: Student;
    lesson: Lesson & {
        subject: Subject;
        class: Class;
    };
};

const AttendanceListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { page, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = userId;

    const columns = [
        { header: "Học sinh", accessor: "student" },
        { header: "Môn học/Bài học", accessor: "lesson", className: "hidden md:table-cell" },
        { header: "Lớp", accessor: "class", className: "hidden md:table-cell" },
        { header: "Ngày", accessor: "date", className: "hidden md:table-cell" },
        { header: "Trạng thái", accessor: "present", className: "hidden md:table-cell" },
        ...(role === "admin" || role === "teacher" ? [{ header: "Tùy chọn", accessor: "action" }] : []),
    ];

    const renderRow = (item: AttendanceList) => (
        <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
        >
            <td className="flex items-center gap-4 p-4">
                <div className="flex flex-col">
                    <h3 className="font-semibold">{item.student.surname} {item.student.name}</h3>
                    <span className="text-xs text-gray-500">{item.student.username}</span>
                </div>
            </td>
            <td className="hidden md:table-cell">{item.lesson.name}</td>
            <td className="hidden md:table-cell">{item.lesson.class.name}</td>
            <td className="hidden md:table-cell">
                {new Date(item.date).toLocaleDateString("vi-VN")}
            </td>
            <td className="hidden md:table-cell">
                {item.present ? (
                    <span className="text-green-600 font-bold">Có mặt</span>
                ) : (
                    <span className="text-red-600 font-bold">Vắng</span>
                )}
            </td>
            <td>
                <div className="flex items-center gap-2">
                    {(role === "admin" || role === "teacher") && (
                        <>
                            <FormContainer table="attendance" type="update" data={item} />
                            <FormContainer table="attendance" type="delete" id={item.id} />
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    // Xử lý Filter Query
    const query: any = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "studentId":
                        query.studentId = value;
                        break;
                    case "search":
                        query.student = {
                            name: { contains: value, mode: "insensitive" },
                        };
                        break;
                    default:
                        break;
                }
            }
        }
    }

    // Phân quyền xem dữ liệu
    if (role === "student") {
        query.studentId = currentUserId!;
    } else if (role === "parent") {
        query.student = { parentId: currentUserId! };
    } else if (role === "teacher") {
        // Giáo viên xem điểm danh của các bài học mình dạy
        query.lesson = { teacherId: currentUserId! };
    }

    const [data, count] = await prisma.$transaction([
        prisma.attendance.findMany({
            where: query,
            include: {
                student: true,
                lesson: {
                    include: {
                        subject: true,
                        class: true,
                    }
                },
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
            orderBy: { date: 'desc' } // Mới nhất lên đầu
        }),
        prisma.attendance.count({ where: query }),
    ]);

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">Điểm danh</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="attendance" type="create" />
                        )}
                    </div>
                </div>
            </div>
            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
        </div>
    );
};

export default AttendanceListPage;