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

    // Class chung cho các ô input/select
    const inputClass = "ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-[40px]";

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo lớp học mới" : "Cập nhật lớp học"}
            </h1>

            {/* SỬA LAYOUT: Grid 2 cột đều nhau (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- Ô 1: TÊN LỚP --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Tên lớp</label>
                    <input
                        type="text"
                        {...register("name")}
                        defaultValue={data?.name}
                        className={inputClass}
                        placeholder="VD: 1A"
                    />
                    {errors.name?.message && (
                        <p className="text-xs text-red-400">{errors.name.message.toString()}</p>
                    )}
                </div>

                {/* --- Ô 2: SĨ SỐ --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Sĩ số</label>
                    <input
                        type="number"
                        {...register("capacity")}
                        defaultValue={data?.capacity}
                        className={inputClass}
                        placeholder="VD: 40"
                    />
                    {errors.capacity?.message && (
                        <p className="text-xs text-red-400">{errors.capacity.message.toString()}</p>
                    )}
                </div>

                {/* --- Ô 3: CẤP BẬC --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Cấp bậc</label>
                    <select
                        className={inputClass}
                        {...register("gradeId")}
                        defaultValue={data?.gradeId}
                    >
                        <option value="">-- Chọn khối --</option>
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

                {/* --- Ô 4: GIẢNG VIÊN CHỦ NHIỆM --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Giảng viên chủ nhiệm</label>
                    <select
                        className={inputClass}
                        {...register("supervisorId")}
                        defaultValue={data?.supervisorId || ""}
                    >
                        <option value="">-- Chọn giảng viên --</option>
                        {teachers.map((teacher: { id: string; name: string; surname: string }) => (
                            <option value={teacher.id} key={teacher.id}>
                                {teacher.surname} {teacher.name}
                            </option>
                        ))}
                    </select>
                    {errors.supervisorId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.supervisorId.message.toString()}
                        </p>
                    )}
                </div>

                {/* Input ẩn chứa ID */}
                {data && (
                    <input type="hidden" {...register("id")} defaultValue={data?.id} />
                )}

            </div>

            <button
                className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 hover:bg-blue-500 transition-colors w-full"
                disabled={isPending}
            >
                {isPending ? "Đang xử lý..." : (type === "create" ? "Tạo" : "Cập nhật")}
            </button>
        </form>
    );
};

export default ClassForm;