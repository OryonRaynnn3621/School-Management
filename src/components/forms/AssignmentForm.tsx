"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useTransition } from "react";
import { assignmentSchema, AssignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AssignmentForm = ({
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

    // Helper: Format ngày giờ cho input datetime-local
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
    } = useForm<AssignmentSchema>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: data
            ? {
                ...data,
                startDate: formatDateTime(data.startDate),
                dueDate: formatDateTime(data.dueDate),
            }
            : undefined,
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        const submittedData = {
            ...formData,
            startDate: new Date(formData.startDate),
            dueDate: new Date(formData.dueDate),
        };

        startTransition(async () => {
            const action = type === "create" ? createAssignment : updateAssignment;
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

    const { lessons } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo bài tập mới" : "Cập nhật bài tập"}
            </h1>

            <div className="flex flex-col gap-6">

                {/* --- DÒNG 1: TIÊU ĐỀ --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Tiêu đề bài tập</label>
                    <input
                        type="text"
                        {...register("title")}
                        defaultValue={data?.title}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        placeholder="Ví dụ: Bài tập về nhà Toán chương 1"
                    />
                    {errors.title?.message && (
                        <p className="text-xs text-red-400">{errors.title.message.toString()}</p>
                    )}
                </div>

                {/* --- DÒNG 2: NGÀY BẮT ĐẦU & HẠN NỘP --- */}
                <div className="flex w-full gap-4 flex-col md:flex-row">

                    {/* Start Date */}
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Ngày bắt đầu</label>
                        <input
                            type="datetime-local"
                            {...register("startDate")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        />
                        {errors.startDate?.message && (
                            <p className="text-xs text-red-400">{errors.startDate.message.toString()}</p>
                        )}
                    </div>

                    {/* Due Date */}
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Hạn nộp</label>
                        <input
                            type="datetime-local"
                            {...register("dueDate")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        />
                        {errors.dueDate?.message && (
                            <p className="text-xs text-red-400">{errors.dueDate.message.toString()}</p>
                        )}
                    </div>
                </div>

                {/* --- DÒNG 3: CHỌN BÀI HỌC (LESSON) --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Bài học ở khóa học</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        {...register("lessonId")}
                        defaultValue={data?.lessonId}
                    >
                        <option value="">-- Chọn khóa học --</option>
                        {lessons?.map((lesson: { id: number; name: string }) => (
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

export default AssignmentForm;