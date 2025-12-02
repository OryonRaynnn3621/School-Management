"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useTransition } from "react";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const AnnouncementForm = ({
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
    } = useForm<AnnouncementSchema>({
        resolver: zodResolver(announcementSchema),
        defaultValues: data
            ? {
                ...data,
                date: data.date
                    ? new Date(data.date).toISOString().split("T")[0]
                    : undefined,
            }
            : undefined,
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        // Ensure date is processed correctly if needed
        const submittedData = {
            ...formData,
            date: new Date(formData.date),
        };

        startTransition(async () => {
            const action = type === "create" ? createAnnouncement : updateAnnouncement;
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

    const { classes } = relatedData;

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo thông báo mới" : "Cập nhật thông báo"}
            </h1>

            <div className="flex flex-col gap-6"> {/* Tăng gap lên 6 cho thoáng */}

                {/* --- HÀNG 1: TIÊU ĐỀ (Full Width) --- */}
                {/* Thay InputField bằng thẻ input HTML thường để kiểm soát width */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Tiêu đề</label>
                    <input
                        type="text"
                        {...register("title")}
                        defaultValue={data?.title}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        placeholder="Nhập tiêu đề thông báo..."
                    />
                    {errors.title?.message && (
                        <p className="text-xs text-red-400">{errors.title.message.toString()}</p>
                    )}
                </div>

                {/* --- HÀNG 2: NGÀY & LỚP (Mỗi bên 50%) --- */}
                <div className="flex w-full gap-4 flex-col md:flex-row">

                    {/* Ô Ngày (Date) */}
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Ngày</label>
                        <input
                            type="date"
                            {...register("date")}
                            defaultValue={data?.date}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        />
                        {errors.date?.message && (
                            <p className="text-xs text-red-400">{errors.date.message.toString()}</p>
                        )}
                    </div>

                    {/* Ô Lớp (Class) */}
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Lớp (Tùy chọn)</label>
                        <select
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                            {...register("classId")}
                            defaultValue={data?.classId}
                        >
                            <option value="">-- Thông báo chung --</option>
                            {classes.map((classItem: { id: number; name: string }) => (
                                <option value={classItem.id} key={classItem.id}>
                                    {classItem.name}
                                </option>
                            ))}
                        </select>
                        {errors.classId?.message && (
                            <p className="text-xs text-red-400">
                                {errors.classId.message.toString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* --- HÀNG 3: NỘI DUNG (Textarea) --- */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Nội dung</label>
                    <textarea
                        {...register("description")}
                        defaultValue={data?.description}
                        className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full h-32 resize-none focus:ring-blue-400 focus:outline-none transition-all"
                        placeholder="Nhập nội dung chi tiết..."
                    />
                    {errors.description?.message && (
                        <p className="text-xs text-red-400">
                            {errors.description.message.toString()}
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

export default AnnouncementForm;