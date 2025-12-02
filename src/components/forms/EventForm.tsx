"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useTransition } from "react";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const EventForm = ({
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

    // Helper to format ISO date string to YYYY-MM-DDTHH:mm for input
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
    } = useForm<EventSchema>({
        resolver: zodResolver(eventSchema),
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
            const action = type === "create" ? createEvent : updateEvent;
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
                {type === "create" ? "Tạo sự kiện mới" : "Cập nhật sự kiện"}
            </h1>

            <div className="flex flex-col gap-6">

                {/* Title */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Tiêu đề</label>
                    <input
                        type="text"
                        {...register("title")}
                        defaultValue={data?.title}
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
                        placeholder="Nhập tiêu đề sự kiện..."
                    />
                    {errors.title?.message && (
                        <p className="text-xs text-red-400">{errors.title.message.toString()}</p>
                    )}
                </div>

                {/* Class Selection */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Lớp (Tùy chọn)</label>
                    <select
                        className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        {...register("classId")}
                        defaultValue={data?.classId}
                    >
                        <option value="">-- Sự kiện chung --</option>
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

                {/* Start Time & End Time */}
                <div className="flex w-full gap-4 flex-col md:flex-row">
                    {/* Start Time */}
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Thời gian bắt đầu</label>
                        <input
                            type="datetime-local"
                            {...register("startTime")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        />
                        {errors.startTime?.message && (
                            <p className="text-xs text-red-400">{errors.startTime.message.toString()}</p>
                        )}
                    </div>

                    {/* End Time */}
                    <div className="flex flex-col gap-2 w-full md:w-1/2">
                        <label className="text-xs text-gray-500">Thời gian kết thúc</label>
                        <input
                            type="datetime-local"
                            {...register("endTime")}
                            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full cursor-pointer"
                        />
                        {errors.endTime?.message && (
                            <p className="text-xs text-red-400">{errors.endTime.message.toString()}</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs text-gray-500">Mô tả (Tùy chọn)</label>
                    <textarea
                        {...register("description")}
                        defaultValue={data?.description}
                        className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full h-32 resize-none focus:ring-blue-400 focus:outline-none transition-all"
                        placeholder="Nhập mô tả sự kiện..."
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

export default EventForm;