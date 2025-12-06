"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Shield, GraduationCap, Users, CheckCircle2 } from "lucide-react";

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();

    useEffect(() => {
        const role = user?.publicMetadata.role;
        if (role) {
            router.push(`/${role}`);
        }
    }, [user, router]);

    return (
        <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden font-sans">

            {/* --- BACKGROUND DECORATION --- */}
            {/* Hình tròn màu nền tạo hiệu ứng chiều sâu */}
            <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            {/* --- CỘT TRÁI: GIỚI THIỆU (GLASSMORPHISM) --- */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-16 overflow-hidden">
                {/* Lớp phủ Gradient và ảnh nền */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>

                {/* Hình tròn trang trí bay bay */}
                <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-40 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-bounce duration-[3000ms]"></div>

                {/* Nội dung bên trái */}
                <div className="relative z-10 text-white h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl border border-white/10 shadow-inner">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">TPK Learning Hub</h1>
                            <p className="text-xs text-blue-100/80 font-medium tracking-widest uppercase">Quản lý giáo dục toàn diện</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-8 mt-12">
                        <h2 className="text-4xl font-bold leading-tight">
                            Nền tảng kết nối <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">
                                Giáo dục Tương lai
                            </span>
                        </h2>

                        {/* Danh sách tính năng */}
                        <div className="space-y-4">
                            {[
                                "Quản lý học tập thông minh",
                                "Kết nối Phụ huynh - Trung tâm",
                                "Theo dõi tiến độ học tập hiệu quả",
                                "Bảo mật dữ liệu tuyệt đối"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-blue-50/90">
                                    <CheckCircle2 size={20} className="text-green-400" />
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Khối 4 Icon ở giữa */}
                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Card 1: Lãnh đạo */}
                            <div className="bg-white text-blue-600 w-40 h-40 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transform hover:scale-105 transition-all cursor-default">
                                <Shield size={48} strokeWidth={1.5} />
                                <span className="font-semibold text-sm">Lãnh đạo</span>
                            </div>
                            {/* Card 2: Giáo viên (Active style) */}
                            <div className="bg-[#fbbf24] text-white w-40 h-40 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transform translate-y-8 hover:scale-105 transition-all cursor-default border-4 border-white/20">
                                <User size={48} strokeWidth={1.5} />
                                <span className="font-semibold text-sm">Giáo viên</span>
                            </div>
                            {/* Card 3: Học sinh */}
                            <div className="bg-blue-400 text-white w-40 h-40 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transform -translate-y-8 hover:scale-105 transition-all cursor-default">
                                <GraduationCap size={48} strokeWidth={1.5} />
                                <span className="font-semibold text-sm">Học sinh</span>
                            </div>
                            {/* Card 4: Phụ huynh */}
                            <div className="bg-white text-blue-600 w-40 h-40 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transform hover:scale-105 transition-all cursor-default">
                                <Users size={48} strokeWidth={1.5} />
                                <span className="font-semibold text-sm">Phụ huynh</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-blue-200/60 mt-8">
                        © 2025 TPK Education System. All rights reserved.
                    </div>
                </div>
            </div>

            {/* --- CỘT PHẢI: FORM ĐĂNG NHẬP --- */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-4 lg:p-12 relative z-10">
                <SignIn.Root>
                    <SignIn.Step
                        name="start"
                        className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col gap-6"
                    >
                        {/* Header Form */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-extrabold text-gray-900">Chào mừng trở lại! 👋</h1>
                            <p className="text-sm text-gray-500">Vui lòng nhập thông tin để truy cập.</p>
                        </div>

                        <Clerk.GlobalError className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center font-medium" />

                        <div className="flex flex-col gap-5">
                            {/* Username */}
                            <Clerk.Field name="identifier" className="flex flex-col gap-1.5 group">
                                <Clerk.Label className="text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors">
                                    Tài khoản
                                </Clerk.Label>
                                <div className="relative">
                                    <Clerk.Input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400 font-medium"
                                        placeholder="Nhập tên đăng nhập..."
                                    />
                                </div>
                                <Clerk.FieldError className="text-xs text-red-500 font-medium mt-1" />
                            </Clerk.Field>

                            {/* Password */}
                            <Clerk.Field name="password" className="flex flex-col gap-1.5 group">
                                <div className="flex justify-between items-center">
                                    <Clerk.Label className="text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors">
                                        Mật khẩu
                                    </Clerk.Label>

                                </div>
                                <div className="relative">
                                    <Clerk.Input
                                        type="password"
                                        required
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400 font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Clerk.FieldError className="text-xs text-red-500 font-medium mt-1" />
                            </Clerk.Field>

                            {/* Button */}
                            <SignIn.Action
                                submit
                                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 mt-2 text-sm uppercase tracking-wide"
                            >
                                Đăng nhập ngay
                            </SignIn.Action>
                        </div>


                    </SignIn.Step>
                </SignIn.Root>
            </div>
        </div>
    );
};

export default LoginPage;