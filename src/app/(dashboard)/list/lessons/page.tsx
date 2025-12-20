import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/setting";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // 1. CẬP NHẬT CẤU TRÚC CỘT
  const columns = [
    {
      header: "Tên khóa học", // Cột mới 1
      accessor: "name",
    },
    {
      header: "Môn học",
      accessor: "subject",
    },
    {
      header: "Lớp học",
      accessor: "class",
    },
    {
      header: "Giảng viên",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Bắt đầu", // Cột mới 2
      accessor: "startTime",
      className: "hidden lg:table-cell",
    },
    {
      header: "Kết thúc", // Cột mới 3
      accessor: "endTime",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
        {
          header: "Tùy chọn",
          accessor: "action",
        },
      ]
      : []),
  ];

  // 2. CẬP NHẬT GIAO DIỆN HÀNG (ROW)
  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Cột Tên khóa học */}
      <td className="p-4 font-semibold text-gray-700">{item.name}</td>

      {/* Cột Môn học */}
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>

      {/* Cột Lớp học */}
      <td>{item.class.name}</td>

      {/* Cột Giảng viên */}
      <td className="hidden md:table-cell">
        {item.teacher.surname + " " + item.teacher.name}
      </td>

      {/* Cột Thời gian bắt đầu (Format ngày giờ Việt Nam) */}
      <td className="hidden lg:table-cell">
        {new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(item.startTime)}
      </td>

      {/* Cột Thời gian kết thúc */}
      <td className="hidden lg:table-cell">
        {new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(item.endTime)}
      </td>

      {/* Cột Tùy chọn */}
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
            query.OR = [
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { name: { contains: value, mode: "insensitive" } }, // Thêm tìm kiếm theo tên khóa học
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Khóa học</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {role === "admin" && <FormContainer table="lesson" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;