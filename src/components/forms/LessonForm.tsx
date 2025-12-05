"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useTransition } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const LessonForm = ({
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
    const { subjects, classes, teachers } = relatedData;

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
    } = useForm<LessonSchema>({
        resolver: zodResolver(lessonSchema),
        defaultValues: data
            ? {
                ...data,
                startTime: formatDateTime(data.startTime),
                endTime: formatDateTime(data.endTime),
            }
            : undefined,
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        const submittedData = {
            ...formData,
            startTime: new Date(formData.startTime),
            endTime: new Date(formData.endTime),
        };

        startTransition(async () => {
            const action = type === "create" ? createLesson : updateLesson;
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

    // Class chung cho các ô input để đồng bộ chiều cao và style
    const inputClass = "ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-[40px]";

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo khóa học mới" : "Cập nhật khóa học"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Tên khóa học */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Tên khóa học</label>
                    <input
                        type="text"
                        {...register("name")}
                        className={inputClass}
                        placeholder="VD: Toán Đại Số - Tiết 1"
                    />
                    {errors.name?.message && <p className="text-xs text-red-400">{errors.name.message.toString()}</p>}
                </div>

                {/* Thứ trong tuần */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Thứ</label>
                    <select className={inputClass} {...register("day")}>
                        <option value="MONDAY">Thứ Hai</option>
                        <option value="TUESDAY">Thứ Ba</option>
                        <option value="WEDNESDAY">Thứ Tư</option>
                        <option value="THURSDAY">Thứ Năm</option>
                        <option value="FRIDAY">Thứ Sáu</option>
                    </select>
                    {errors.day?.message && <p className="text-xs text-red-400">{errors.day.message.toString()}</p>}
                </div>

                {/* Thời gian bắt đầu */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Thời gian bắt đầu</label>
                    <input
                        type="datetime-local"
                        {...register("startTime")}
                        className={inputClass}
                    />
                    {errors.startTime?.message && <p className="text-xs text-red-400">{errors.startTime.message.toString()}</p>}
                </div>

                {/* Thời gian kết thúc */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Thời gian kết thúc</label>
                    <input
                        type="datetime-local"
                        {...register("endTime")}
                        className={inputClass}
                    />
                    {errors.endTime?.message && <p className="text-xs text-red-400">{errors.endTime.message.toString()}</p>}
                </div>

                {/* Chọn Môn học */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Môn học</label>
                    <select className={inputClass} {...register("subjectId")}>
                        <option value="">-- Chọn môn học --</option>
                        {subjects?.map((subject: { id: number; name: string }) => (
                            <option value={subject.id} key={subject.id}>{subject.name}</option>
                        ))}
                    </select>
                    {errors.subjectId?.message && <p className="text-xs text-red-400">{errors.subjectId.message.toString()}</p>}
                </div>

                {/* Chọn Lớp học */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Lớp học</label>
                    <select className={inputClass} {...register("classId")}>
                        <option value="">-- Chọn lớp học --</option>
                        {classes?.map((classItem: { id: number; name: string }) => (
                            <option value={classItem.id} key={classItem.id}>{classItem.name}</option>
                        ))}
                    </select>
                    {errors.classId?.message && <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>}
                </div>

                {/* Chọn Giảng viên */}
                <div className="flex flex-col gap-2 w-full md:col-span-2">
                    <label className="text-xs text-gray-500">Giảng viên phụ trách</label>
                    <select className={inputClass} {...register("teacherId")}>
                        <option value="">-- Chọn giảng viên --</option>
                        {teachers?.map((teacher: { id: string; name: string; surname: string }) => (
                            <option value={teacher.id} key={teacher.id}>
                                {teacher.surname} {teacher.name}
                            </option>
                        ))}
                    </select>
                    {errors.teacherId?.message && <p className="text-xs text-red-400">{errors.teacherId.message.toString()}</p>}
                </div>

                {data && (
                    <input type="hidden" {...register("id")} defaultValue={data?.id} />
                )}
            </div>

            <button
                className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 hover:bg-blue-500 transition-colors w-full"
                disabled={isPending}
            >
                {isPending ? "Đang xử lý..." : (type === "create" ? "Tạo khóa học" : "Cập nhật")}
            </button>
        </form>
    );
};

export default LessonForm;