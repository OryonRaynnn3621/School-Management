// components/Navbar.tsx
import { UserButton, SignedIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";

const Navbar = async () => {
  const user = await currentUser();
  const announcementCount = await prisma.announcement.count();

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-end h-16 px-6 gap-6">

        {/* Nút Thông báo */}
        <Link
          href="/list/announcements"
          className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
        >
          <Image
            src="/announcement.png"
            alt="Thông báo"
            width={22}
            height={22}
          />
          {announcementCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
              {announcementCount > 99 ? "99+" : announcementCount}
            </span>
          )}
          <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
            Thông báo
          </span>
        </Link>

        {/* Thông tin người dùng + Avatar */}
        <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {user.fullName || user.firstName || "Người dùng"}
            </p>
            <p className="text-xs text-gray-500">
              {(user.publicMetadata?.role as string) === "admin" && "Quản trị viên"}
              {(user.publicMetadata?.role as string) === "teacher" && "Giáo viên"}
              {(user.publicMetadata?.role as string) === "student" && "Học sinh"}
              {(user.publicMetadata?.role as string) === "parent" && "Phụ huynh"}
              {(!user.publicMetadata?.role || user.publicMetadata?.role === "user") && "Khách"}
            </p>
          </div>

          {/* PHIÊN BẢN CHUẨN 100% - KHÔNG LỖI TYPESCRIPT */}
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 ring-2 ring-gray-300 ring-offset-2 hover:ring-blue-500 transition-all",
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;