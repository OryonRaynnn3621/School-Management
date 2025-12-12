import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
      _count: { subjects: number; lessons: number; classes: number };
    })
    | null = await prisma.teacher.findUnique({
      where: { id },
      include: {
        subjects: true,
        _count: {
          select: {
            subjects: true,
            lessons: true,
            classes: true,
          },
        },
      },
    });

  if (!teacher) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* --- LEFT COLUMN: Header & Lịch --- */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">

        {/* 1. PROFILE HEADER (Mới: Gọn gàng theo chiều ngang) */}
        <div className="bg-lamaSky py-6 px-6 rounded-md flex flex-col md:flex-row gap-6 items-center shadow-sm">
          {/* Avatar */}
          <div className="w-28 h-28 relative shrink-0">
            <Image
              src={teacher.img || "/noAvatar.png"}
              alt=""
              fill
              className="rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>

          {/* Tên & Nút sửa */}
          <div className="flex flex-col items-center md:items-start flex-1 gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                {teacher.surname} {teacher.name}
              </h1>
              {/* Nút sửa làm nổi bật hơn */}
              {role === "admin" && (
                <div className="bg-white p-1.5 rounded-full shadow-sm hover:bg-gray-100 transition cursor-pointer flex items-center justify-center">
                  <FormContainer table="teacher" type="update" data={teacher} />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium bg-white/50 px-2 py-1 rounded-md">
              @{teacher.username}
            </p>
          </div>

          {/* Stats (Thống kê nằm bên phải) */}
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm w-20">
              <span className="text-lg font-bold text-lamaSky">{teacher._count.classes}</span>
              <span className="text-xs text-gray-500 font-medium uppercase">Lớp</span>
            </div>
            <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm w-20">
              <span className="text-lg font-bold text-lamaPurple">{teacher._count.lessons}</span>
              <span className="text-xs text-gray-500 font-medium uppercase">Tiết</span>
            </div>
            <div className="flex flex-col items-center bg-white p-3 rounded-md shadow-sm w-20">
              <span className="text-lg font-bold text-lamaYellow">{teacher._count.subjects}</span>
              <span className="text-xs text-gray-500 font-medium uppercase">Môn</span>
            </div>
          </div>
        </div>

        {/* 2. CALENDAR */}
        <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 h-[700px]">
          <h1 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">
            Lịch giảng dạy & Thời khóa biểu
          </h1>
          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* --- RIGHT COLUMN: Thông tin liên hệ & Lối tắt --- */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">

        {/* 3. CONTACT INFO (Đã chuyển sang đây) */}
        <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Thông tin liên hệ
          </h2>
          <div className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lamaSkyLight rounded-full shrink-0">
                <Image src="/mail.png" alt="" width={18} height={18} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-gray-400 font-medium">Email</span>
                <span className="text-sm text-gray-700 font-semibold truncate" title={teacher.email || ""}>
                  {teacher.email || "N/A"}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lamaPurpleLight rounded-full shrink-0">
                <Image src="/phone.png" alt="" width={18} height={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Điện thoại</span>
                <span className="text-sm text-gray-700 font-semibold">
                  {teacher.phone || "N/A"}
                </span>
              </div>
            </div>

            {/* Birthday */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-50 rounded-full shrink-0">
                <Image src="/date.png" alt="" width={18} height={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">Ngày sinh</span>
                <span className="text-sm text-gray-700 font-semibold">
                  {new Date(teacher.birthday).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lamaYellowLight rounded-full shrink-0">
                {/* Dùng tạm icon 📍 nếu chưa có file map.png */}
                <span className="text-lg leading-none">📍</span>
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs text-gray-400 font-medium">Địa chỉ</span>
                <span className="text-sm text-gray-700 font-semibold truncate" title={teacher.address}>
                  {teacher.address}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 4. SHORTCUTS */}
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
          <h1 className="text-xl font-semibold mb-4">Lối tắt</h1>
          <div className="flex gap-2 flex-wrap">
            <Link
              className="px-3 py-2 rounded-md bg-lamaSky text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/classes?supervisorId=${teacher.id}`}
            >
              Lớp chủ nhiệm
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-lamaPurple text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/students?teacherId=${teacher.id}`}
            >
              DS Học sinh
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-lamaYellow text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/lessons?teacherId=${teacher.id}`}
            >
              Khóa học
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-pink-500 text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/exams?teacherId=${teacher.id}`}
            >
              Lịch thi
            </Link>
            <Link
              className="px-3 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-opacity-90 transition-all shadow-sm flex-1 text-center whitespace-nowrap"
              href={`/list/assignments?teacherId=${teacher.id}`}
            >
              Bài tập
            </Link>
          </div>
        </div>

        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;