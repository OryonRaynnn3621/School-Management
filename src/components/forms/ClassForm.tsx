"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import { Dispatch, SetStateAction, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
    type,
    data,
    setOpen,
    relatedData,
}: {
    type: "create" | "update";
    data?: any;
    setOpen: Dispatch<SetStateAction<boolean>>;
    relatedData?: any;
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ClassSchema>({
        resolver: zodResolver(classSchema),
        defaultValues: data
            ? {
                ...data,
                supervisorId: data.supervisorId,
            }
            : undefined,
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        startTransition(async () => {
            const action = type === "create" ? createClass : updateClass;
            try {
                // @ts-ignore
                const result = await action({ success: false, error: false }, formData);

                if (result.success) {
                    toast.success(`Lớp học đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
                    setOpen(false);
                    router.refresh();
                } else {
                    toast.error("Có lỗi xảy ra!");
                }
            } catch (err) {
                toast.error("Lỗi kết nối!");
            }
        });
    });

    const { teachers, grades } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo lớp học mới" : "Cập nhật lớp học"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- CỘT TRÁI: THÔNG TIN LỚP (ĐÃ CHỈNH SỬA LAYOUT) --- */}
                <div className="flex flex-col gap-4">

                    {/* Hàng 1: Tên lớp và Sĩ số nằm ngang nhau (50-50) */}
                    <div className="flex gap-4">
                        {/* Tên lớp */}
                        <div className="flex flex-col gap-2 w-1/2">
                            <label className="text-xs text-gray-500">Tên lớp</label>
                            <input
                                type="text"
                                {...register("name")}
                                defaultValue={data?.name}
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                placeholder="VD: 1A"
                            />
                            {errors.name?.message && (
                                <p className="text-xs text-red-400">{errors.name.message.toString()}</p>
                            )}
                        </div>

                        {/* Số lượng */}
                        <div className="flex flex-col gap-2 w-1/2">
                            <label className="text-xs text-gray-500">Sĩ số</label>
                            <input
                                type="number"
                                {...register("capacity")}
                                defaultValue={data?.capacity}
                                className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                                placeholder="VD: 40"
                            />
                            {errors.capacity?.message && (
                                <p className="text-xs text-red-400">{errors.capacity.message.toString()}</p>
                            )}
                        </div>
                    </div>

                    {/* Hàng 2: Khối lớp (Full chiều rộng cột trái) */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">Khối / Cấp bậc</label>
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                            {...register("gradeId")}
                            defaultValue={data?.gradeId}
                        >
                            {grades.map((grade: { id: number; level: number }) => (
                                <option value={grade.id} key={grade.id}>
                                    Khối {grade.level}
                                </option>
                            ))}
                        </select>
                        {errors.gradeId?.message && (
                            <p className="text-xs text-red-400">
                                {errors.gradeId.message.toString()}
                            </p>
                        )}
                    </div>

                    {/* Input ẩn chứa ID */}
                    {data && (
                        <input type="hidden" {...register("id")} defaultValue={data?.id} />
                    )}
                </div>

                {/* --- CỘT PHẢI: CHỌN GIẢNG VIÊN (GIỮ NGUYÊN) --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Giảng viên chủ nhiệm</label>

                    <div className="border border-gray-300 rounded-md p-3 max-h-[250px] overflow-y-auto flex flex-col gap-2">
                        <div className="relative">
                            <input
                                type="radio"
                                id="no-teacher"
                                value=""
                                {...register("supervisorId")}
                                className="peer hidden"
                            />
                            <label
                                htmlFor="no-teacher"
                                className="flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-gray-100 peer-checked:bg-gray-200 peer-checked:font-semibold peer-checked:text-gray-700"
                            >
                                <span className="text-sm italic text-gray-500">-- Chưa phân công --</span>
                            </label>
                        </div>

                        {teachers.map((teacher: { id: string; name: string; surname: string }) => (
                            <div key={teacher.id} className="relative">
                                <input
                                    type="radio"
                                    id={`teacher-${teacher.id}`}
                                    value={teacher.id}
                                    {...register("supervisorId")}
                                    className="peer hidden"
                                />
                                <label
                                    htmlFor={`teacher-${teacher.id}`}
                                    className="flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border border-transparent hover:border-blue-200 hover:bg-blue-50 peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs">
                                        {teacher.name[0]}{teacher.surname[0]}
                                    </div>
                                    <span className="text-sm font-medium">
                                        {teacher.name} {teacher.surname}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>

                    {errors.supervisorId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.supervisorId.message.toString()}
                        </p>
                    )}
                    <p className="text-xs text-gray-400">
                        * Chọn 1 giảng viên để làm chủ nhiệm.
                    </p>
                </div>

            </div>

            <button
                className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 hover:bg-blue-500 transition-colors"
                disabled={isPending}
            >
                {isPending ? "Đang xử lý..." : (type === "create" ? "Tạo" : "Cập nhật")}
            </button>
        </form>
    );
};

export default ClassForm;