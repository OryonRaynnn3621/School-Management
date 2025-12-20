"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction, useTransition } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamForm = ({
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

    const formatDateTime = (dateString: any) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ExamSchema>({
        resolver: zodResolver(examSchema),
        defaultValues: data ? {
            ...data,
            startTime: formatDateTime(data.startTime),
            endTime: formatDateTime(data.endTime),
        } : undefined
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // SỬA: Chỉ giữ lại callback thành công, XÓA callback lỗi (tham số thứ 2)
    const onSubmit = handleSubmit((formData) => {
        const submittedData = {
            ...formData,
            // Chuyển đổi lại thành Date object khi gửi lên server
            startTime: new Date(formData.startTime),
            endTime: new Date(formData.endTime),
        };

        startTransition(async () => {
            const action = type === "create" ? createExam : updateExam;
            try {
                // @ts-ignore
                const result = await action({ success: false, error: false }, submittedData);

                if (result.success) {
                    toast.success(`Lịch kiểm tra đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
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
    // ^--- Đã xóa đoạn ", (validationErrors) => { ... }" ở đây để tắt Toast lỗi

    const { lessons } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo lịch kiểm tra mới" : "Cập nhật lịch kiểm tra"}
            </h1>

            <div className="flex justify-between flex-wrap gap-4">

                {/* --- DÒNG 1 --- */}

                {/* Tiêu đề */}
                <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-xs text-gray-500">Tiêu đề</label>
                    <input
                        type="text"
                        {...register("title")}
                        defaultValue={data?.title}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        placeholder="Nhập tiêu đề..."
                    />
                    {errors.title?.message && (
                        <p className="text-xs text-red-400">{errors.title.message.toString()}</p>
                    )}
                </div>

                {/* Khóa học (Lesson) */}
                <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-xs text-gray-500">Khóa học</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId}
                    >
                        {/* THÊM: Option mặc định */}
                        <option value="">-- Chọn khóa học --</option>

                        {lessons.map((lesson: { id: number; name: string }) => (
                            <option value={lesson.id} key={lesson.id}>
                                {lesson.name}
                            </option>
                        ))}
                    </select>
                    {errors.lessonId?.message && (
                        <p className="text-xs text-red-400">
                            {errors.lessonId.message.toString()}
                        </p>
                    )}
                </div>

                {/* --- DÒNG 2 --- */}

                {/* Bắt đầu */}
                <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-xs text-gray-500">Bắt đầu</label>
                    <input
                        type="datetime-local"
                        {...register("startTime")}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                    />
                    {errors.startTime?.message && (
                        <p className="text-xs text-red-400">{errors.startTime.message.toString()}</p>
                    )}
                </div>

                {/* Kết thúc */}
                <div className="flex flex-col gap-2 w-full md:w-[48%]">
                    <label className="text-xs text-gray-500">Kết thúc</label>
                    <input
                        type="datetime-local"
                        {...register("endTime")}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                    />
                    {errors.endTime?.message && (
                        <p className="text-xs text-red-400">{errors.endTime.message.toString()}</p>
                    )}
                </div>

                {data && (
                    <input type="hidden" {...register("id")} defaultValue={data?.id} />
                )}

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

export default ExamForm;