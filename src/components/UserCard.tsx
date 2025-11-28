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
    teacher: "Giáo viên",
    student: "Học sinh",
    parent: "Phụ huynh",
  };

  const colorMap: Record<typeof type, string> = {
    admin: "bg-[#D6D6FF]",
    teacher: "bg-[#F8E79C]",
    student: "bg-[#C8F1FF]",
    parent: "bg-[#FFD6E7]",
  };

  const currentDate = new Date();
  const dateLabel = `${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  const data = await modelMap[type].count();

  return (
    <div className={`rounded-2xl p-4 flex-1 min-w-[130px] ${colorMap[type]}`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          {dateLabel}
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>

      <h1 className="text-2xl font-semibold my-4">{data}</h1>

      <h2 className="capitalize text-sm font-medium text-gray-600">
        {viMap[type]}
      </h2>
    </div>
  );
};

export default UserCard;
