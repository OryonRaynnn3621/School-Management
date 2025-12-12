import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex bg-[#F7F8FA]">
      {/* LEFT: SIDEBAR */}
      <div className="w-[16%] md:w-[8%] lg:w-[16%] xl:w-[16%] p-4 flex flex-col gap-4 bg-white shadow-xl z-40 overflow-y-auto">

        {/* LOGO AREA - ĐÃ LÀM ĐẸP */}
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-3 mb-4 p-2"
        >
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="logo" fill className="object-contain" />
          </div>
          <span className="hidden lg:block font-bold text-xl text-gray-800 tracking-tight">
            TPK <span className="text-purple-600">Learning Hub</span>

          </span>

        </Link>
        <Menu />
      </div>

      {/* RIGHT: CONTENT */}
      <div className="w-[84%] md:w-[92%] lg:w-[84%] xl:w-[84%] flex flex-col overflow-scroll">
        <Navbar />
        {/* Thêm padding cho nội dung bên trong để không bị dính sát lề */}
        <div className="p-4 bg-[#F7F8FA] min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}