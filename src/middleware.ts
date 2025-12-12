import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/setting";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
    matcher: createRouteMatcher([route]),
    allowedRoles: routeAccessMap[route],
}));

// ĐỊNH NGHĨA ROUTE CÔNG KHAI
// Thêm "/" vào đây để khi Logout xong về trang chủ không bị đá ngược về Sign-in
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    // 1. NẾU NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
    if (userId) {
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        // Nếu họ cố vào trang chủ (/) hoặc trang login (/sign-in)
        // -> Đá thẳng vào Dashboard của Role đó
        if (isPublicRoute(req)) {
            if (role) {
                return NextResponse.redirect(new URL(`/${role}`, req.url));
            }
        }
    }

    // 2. NẾU NGƯỜI DÙNG CHƯA ĐĂNG NHẬP
    if (!userId) {
        // Nếu vào route công khai (Trang chủ, Login...) -> Cho qua
        if (isPublicRoute(req)) {
            return NextResponse.next();
        }
        // Nếu vào các route bảo vệ (Dashboard...) -> Đá về Login
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // 3. KIỂM TRA QUYỀN TRUY CẬP (RBAC) - Cho người đã đăng nhập
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    for (const { matcher, allowedRoles } of matchers) {
        if (matcher(req)) {
            if (!role || !allowedRoles.includes(role)) {
                return NextResponse.redirect(new URL(`/${role || "sign-in"}`, req.url));
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};