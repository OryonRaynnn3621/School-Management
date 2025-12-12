import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Fetch dữ liệu học sinh
  const student:
    | (Student & {
      class: Class & { _count: { lessons: number } };
    })
    | null = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { include: { _count: { select: { lessons: true } } } },
      },
    });

  if (!student) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* --- LEFT COLUMN: Header & Lịch --- */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">

        {/* 1. PROFILE HEADER (Style giống Teacher) */}
        <div className="bg-lamaSky py-6 px-6 rounded-md flex flex-col md:flex-row gap-6 items-center shadow-sm">
          {/* Avatar */}
          <div className="w-28 h-28 relative shrink-0">
            <Image
              src={student.img || "/noAvatar.png"}
              alt=""
              fill
              className="rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>

          {/* Tên & Nút sửa */}
          <div className="flex flex-col items-center md:items-start flex-1 gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                {student.surname + " " + student.name}
              </h1>
              {/* Nút sửa */}
              {role === "admin" && (
                <div className="bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition cursor-pointer flex items-center justify-center">
                  <FormContainer table="student" type="update" data={student} />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium bg-white/50 px-2 py-1 rounded-md">
              Học sinh lớp: {student.class.name}
            </p>
          </div>

          {/* Stats (Thống kê nằm bên phải giống Teacher) */}
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Stat 1: Lớp */}
            <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm w-20">
              <span className="text-lg font-bold text-lamaSky">
                {student.class.name}
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase">
                Lớp
              </span>
            </div>
            {/* Stat 2: Cấp bậc (Lấy ký tự đầu của lớp, vd: 6A -> 6) */}
            <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm w-20">
              <span className="text-lg font-bold text-lamaPurple">
                {student.class.name.charAt(0)}
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase">
                Cấp
              </span>
            </div>
            {/* Stat 3: Số tiết học */}
            <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm w-20">
              <span className="text-lg font-bold text-lamaYellow">
                {student.class._count.lessons}
              </span>
              <span className="text-xs text-gray-500 font-medium uppercase">
                Tiết
              </span>
            </div>
          </div>
        </div>

        {/* 2. CALENDAR */}
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 h-[700px]">
          <h1 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
            Lịch học tập & Thời khóa biểu
          </h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>

      {/* --- RIGHT COLUMN: Thông tin & Lối tắt --- */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">

        {/* 3. CONTACT INFO (Chuyển xuống đây giống Teacher) */}
        <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Thông tin cá nhân
          </h2>
          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lamaSkyLight rounded-full shrink-0">
                <Image src="/mail.png" alt="" width={18} height={18} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-gray-400 font-medium">Email</span>
                <span
                  className="text-sm text-gray-700 font-semibold truncate"
                  title={student.email || ""}
                >
                  {student.email || "N/A"}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lamaPurpleLight rounded-full shrink-0">
                <Image src="/phone.png" alt="" width={18} height={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">
                  Điện thoại
                </span>
                <span className="text-sm text-gray-700 font-semibold">
                  {student.phone || "N/A"}
                </span>
              </div>
            </div>

            {/* Birthday */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-full shrink-0">
                <Image src="/date.png" alt="" width={18} height={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">
                  Ngày sinh
                </span>
                <span className="text-sm text-gray-700 font-semibold">
                  {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
                </span>
              </div>
            </div>

            {/* Blood Type (Thay cho địa chỉ bên Teacher) */}
            {/* Address */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lamaYellowLight rounded-full shrink-0">
                {/* Dùng tạm icon 📍 nếu chưa có file map.png */}
                <span className="text-lg leading-none">📍</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-gray-400 font-medium">Địa chỉ</span>
                <span className="text-sm text-gray-700 font-semibold truncate" title={student.address}>
                  {student.address}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. SHORTCUTS (Style nút màu sắc giống Teacher) */}
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <h1 className="text-xl font-semibold mb-4">Lối tắt</h1>
          <div className="flex gap-2 flex-wrap">
            <Link
              className="px-3 py-2 rounded-md bg-lamaSky text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/lessons?classId=${student.class.id}`}
            >
              Bài học
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-lamaPurple text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/teachers?classId=${student.class.id}`}
            >
              Giảng viên
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-lamaYellow text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/results?studentId=${student.id}`}
            >
              Kết quả
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-pink-500 text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/exams?classId=${student.class.id}`}
            >
              Lịch thi
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/assignments?classId=${student.class.id}`}
            >
              Bài tập
            </Link>
          </div>
        </div>

        {/* Performance & Announcements */}
        {/* Giữ lại Performance vì đây là biểu đồ quan trọng cho học sinh */}
        {/* <Performance /> */}
        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;