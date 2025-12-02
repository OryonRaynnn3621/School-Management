"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
    } = useForm<SubjectSchema>({
        resolver: zodResolver(subjectSchema),
        defaultValues: data
            ? {
                ...data,
                teachers: data.teachers
                    ? data.teachers.map((teacher: { id: string }) => teacher.id)
                    : [],
            }
            : {
                teachers: [],
            },
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        startTransition(async () => {
            const action = type === "create" ? createSubject : updateSubject;
            try {
                // @ts-ignore
                const result = await action({ success: false, error: false }, formData);

                if (result.success) {
                    toast.success(`Môn học đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
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

    const { teachers } = relatedData ?? { teachers: [] };

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo môn học mới" : "Cập nhật môn học"}
            </h1>

            <div className="flex flex-col gap-6">

                {/* --- SỬA ĐOẠN NÀY: Dùng input thường với w-full để dài ra hết cỡ --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Tên môn học</label>
                    <input
                        type="text"
                        {...register("name")}
                        defaultValue={data?.name}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" // w-full giúp nó dài bằng danh sách bên dưới
                        placeholder="Ví dụ: Tiếng Anh"
                    />
                    {errors.name?.message && (
                        <p className="text-xs text-red-400">{errors.name.message.toString()}</p>
                    )}
                </div>

                {/* Input ẩn chứa ID */}
                {data && (
                    <input type="hidden" {...register("id")} defaultValue={data?.id} />
                )}

                {/* Danh sách chọn giảng viên */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Giảng viên phụ trách</label>

                    <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                        {teachers.map((teacher: { id: string; name: string; surname: string }) => (
                            <div key={teacher.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors">
                                <input
                                    type="checkbox"
                                    id={`teacher-${teacher.id}`}
                                    value={teacher.id}
                                    {...register("teachers")}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label
                                    htmlFor={`teacher-${teacher.id}`}
                                    className="text-sm text-gray-700 cursor-pointer w-full select-none"
                                >
                                    {teacher.surname} {teacher.name}
                                </label>
                            </div>
                        ))}
                    </div>

                    {errors.teachers?.message && (
                        <p className="text-xs text-red-400">
                            {errors.teachers.message.toString()}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                        * Chọn một hoặc nhiều giảng viên bằng cách tích vào ô vuông.
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

export default SubjectForm;