"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface MenuLinkProps {
    item: {
        icon: string;
        label: string;
        href: string;
    };
}

const MenuLink = ({ item }: MenuLinkProps) => {
    const pathname = usePathname();

    // Logic kiểm tra Active:
    // 1. Nếu đường dẫn trùng khớp hoàn toàn.
    // 2. Hoặc nếu đang ở trang con (ví dụ: đang ở /list/teachers/create thì nút Teachers vẫn sáng), trừ trang chủ (/)
    const isActive =
        pathname === item.href ||
        (pathname.startsWith(item.href) && item.href !== "/");

    return (
        <Link
            href={item.href}
            className={`flex items-center justify-center lg:justify-start gap-4 py-2 md:px-2 rounded-md transition-all 
      ${isActive
                    ? "bg-lamaSkyLight text-gray-900 font-semibold" // Style khi đang chọn (Active)
                    : "text-gray-500 hover:bg-lamaSkyLight"      // Style bình thường
                }`}
        >
            {/* Tăng kích thước icon từ 20 lên 24 */}
            <Image src={item.icon} alt="" width={24} height={24} />

            {/* Tăng kích thước chữ (mặc định là text-base ~ 16px, lớn hơn text-sm) */}
            <span className="hidden lg:block text-base">{item.label}</span>
        </Link>
    );
};

export default MenuLink;