import prisma from "@/lib/prisma";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const viMap: Record<typeof type, string> = {
    admin: "Quản trị viên",
    teacher: "Giảng viên",
    student: "Học sinh",
    parent: "Phụ huynh",
  };

  // Sử dụng Gradient màu pastel hiện đại hơn
  const gradientMap: Record<typeof type, string> = {
    admin: "bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200",
    teacher: "bg-gradient-to-br from-yellow-100 to-amber-100 border-yellow-200",
    student: "bg-gradient-to-br from-cyan-100 to-blue-100 border-cyan-200",
    parent: "bg-gradient-to-br from-pink-100 to-rose-100 border-pink-200",
  };

  // Màu text tương ứng để tạo độ tương phản
  const textMap: Record<typeof type, string> = {
    admin: "text-purple-600",
    teacher: "text-yellow-600",
    student: "text-cyan-600",
    parent: "text-pink-600",
  };

  const currentDate = new Date();
  const dateLabel = `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  const data = await modelMap[type].count();

  return (
    <div
      className={`rounded-2xl p-4 flex-1 min-w-[130px] border shadow-sm hover:shadow-md transition-shadow duration-300 ${gradientMap[type]}`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] bg-white/60 px-2 py-1 rounded-full text-gray-500 font-medium border border-white">
          {dateLabel}
        </span>
        {/* <Image src="/more.png" alt="" width={20} height={20} className="opacity-60 cursor-pointer" /> */}
      </div>

      <h1 className={`text-3xl font-bold my-2 ${textMap[type]}`}>
        {data.toLocaleString()} {/* Thêm dấu phẩy ngăn cách hàng nghìn */}
      </h1>

      <h2 className="text-sm font-medium text-gray-600 capitalize">
        {viMap[type]}
      </h2>
    </div>
  );
};

export default UserCard;