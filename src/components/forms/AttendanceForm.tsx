"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AttendanceForm = ({
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
    const { students, lessons } = relatedData;
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AttendanceSchema>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            present: true, // Mặc định là có mặt
        },
    });

    useEffect(() => {
        if (type === "update" && data) {
            reset({
                studentId: data.studentId,
                lessonId: data.lessonId,
                present: data.present,
                date: data.date
                    ? new Date(data.date).toISOString().split("T")[0]
                    : undefined,
            } as any); // <--- THÊM 'as any' VÀO ĐÂY ĐỂ FIX LỖI
        }
    }, [data, type, reset]);

    const onSubmit = handleSubmit((formData) => {
        const submittedData = {
            ...formData,
            date: new Date(formData.date),
        };

        if (type === "update") {
            (submittedData as any).id = data.id;
        }

        startTransition(async () => {
            const action = type === "create" ? createAttendance : updateAttendance;
            try {
                // @ts-ignore
                const result = await action({ success: false, error: false }, submittedData);
                if (result.success) {
                    toast.success(result.message);
                    setOpen(false);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (err) {
                toast.error("Lỗi kết nối!");
            }
        });
    });

    const inputClass = "ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-[40px]";

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo điểm danh mới" : "Cập nhật điểm danh"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Học sinh */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Học sinh</label>
                    <select className={inputClass} {...register("studentId")}>
                        <option value="">-- Chọn học sinh --</option>
                        {students?.map((student: { id: string; name: string; surname: string }) => (
                            <option value={student.id} key={student.id}>
                                {student.surname} {student.name}
                            </option>
                        ))}
                    </select>
                    {errors.studentId?.message && <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>}
                </div>

                {/* Bài học */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Khóa học</label>
                    <select className={inputClass} {...register("lessonId")}>
                        <option value="">-- Chọn khóa học --</option>
                        {lessons?.map((lesson: { id: number; name: string; class: { name: string } }) => (
                            <option value={lesson.id} key={lesson.id}>
                                {lesson.name} ({lesson.class.name})
                            </option>
                        ))}
                    </select>
                    {errors.lessonId?.message && <p className="text-xs text-red-400">{errors.lessonId.message.toString()}</p>}
                </div>

                {/* Ngày */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Ngày</label>
                    <input type="date" className={inputClass} {...register("date")} />
                    {errors.date?.message && <p className="text-xs text-red-400">{errors.date.message.toString()}</p>}
                </div>

                {/* Trạng thái (Có mặt/Vắng) */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Trạng thái</label>
                    <select
                        className={inputClass}
                        {...register("present", {
                            setValueAs: (v) => v === "true" // Chuyển chuỗi "true"/"false" thành boolean
                        })}
                    >
                        <option value="true">Có mặt</option>
                        <option value="false">Vắng mặt</option>
                    </select>
                    {errors.present?.message && <p className="text-xs text-red-400">{errors.present.message.toString()}</p>}
                </div>

            </div>

            <button
                className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 hover:bg-blue-500 transition-colors w-full"
                disabled={isPending}
            >
                {isPending ? "Đang xử lý..." : (type === "create" ? "Lưu" : "Cập nhật")}
            </button>
        </form>
    );
};

export default AttendanceForm;