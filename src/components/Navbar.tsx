import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
// import ToggleThemeButton from "@/components/ToggleThemeButton";


const Navbar = async () => {
  const user = await currentUser();
  const announcementCount = await prisma.announcement.count();

  return (
    <div className="flex items-center justify-between p-4">

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
          <Image src="/message.png" alt="" width={20} height={20} />
        </div>

        {/* ANNOUNCEMENTS BUTTON */}
        <Link
          href="/list/announcements"
          className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative"
        >
          <Image src="/announcement.png" alt="" width={20} height={20} />

          {announcementCount > 0 && (
            <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
              {announcementCount}
            </div>
          )}
        </Link>

        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.fullName || user?.firstName || "User"}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>

        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
