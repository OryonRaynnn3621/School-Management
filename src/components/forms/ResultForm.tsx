"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ResultForm = ({
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
    const { students, exams, assignments } = relatedData;

    // State quản lý loại bài thi
    const [assessmentType, setAssessmentType] = useState<"exam" | "assignment">("exam");

    const {
        register,
        handleSubmit,
        reset, // Lấy hàm reset để nạp dữ liệu cũ
        formState: { errors },
    } = useForm<ResultSchema>({
        resolver: zodResolver(resultSchema),
        defaultValues: {
            score: 0,
        },
    });

    // --- USE EFFECT: NẠP DỮ LIỆU CŨ ---
    useEffect(() => {
        if (type === "update" && data) {
            // 1. Tự động xác định loại bài thi dựa trên ID có sẵn
            const currentType = data.examId ? "exam" : "assignment";
            setAssessmentType(currentType);

            // 2. Điền dữ liệu vào form
            reset({
                studentId: data.studentId,
                score: data.score,
                // Ép kiểu về số để dropdown nhận diện được
                examId: data.examId ? Number(data.examId) : null,
                assignmentId: data.assignmentId ? Number(data.assignmentId) : null,
            });
        }
    }, [data, type, reset]);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        const submittedData = { ...formData };

        // Xóa ID thừa của loại không chọn
        if (assessmentType === "exam") {
            submittedData.assignmentId = null;
            if (submittedData.examId) submittedData.examId = Number(submittedData.examId);
        } else {
            submittedData.examId = null;
            if (submittedData.assignmentId) submittedData.assignmentId = Number(submittedData.assignmentId);
        }

        if (type === "update") {
            (submittedData as any).id = data.id;
        }

        startTransition(async () => {
            const action = type === "create" ? createResult : updateResult;
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

    return (
        <form className="flex flex-col gap-8" onSubmit={onSubmit}>
            <h1 className="text-xl font-semibold">
                {type === "create" ? "Tạo kết quả mới" : "Cập nhật kết quả"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* --- CỘT TRÁI --- */}
                <div className="flex flex-col gap-4">

                    {/* Chọn Học sinh */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">Học sinh</label>
                        <select
                            className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full cursor-pointer"
                            {...register("studentId")}
                        >
                            <option value="">-- Chọn học sinh --</option>
                            {students?.map((student: { id: string; name: string; surname: string }) => (
                                <option value={student.id} key={student.id}>
                                    {student.surname} {student.name}
                                </option>
                            ))}
                        </select>
                        {errors.studentId?.message && (
                            <p className="text-xs text-red-400">{errors.studentId.message.toString()}</p>
                        )}
                    </div>

                    {/* Điểm số (Đã chỉnh height) */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">Điểm số (0-100)</label>
                        {/* Dùng thẻ input thường để dễ chỉnh style */}
                        <input
                            type="number"
                            min={0}
                            max={100}
                            {...register("score")}
                            className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full h-[50px]" // Chiều cao cố định 50px
                            placeholder="Nhập điểm..."
                        />
                        {errors.score?.message && (
                            <p className="text-xs text-red-400">{errors.score.message.toString()}</p>
                        )}
                    </div>
                </div>

                {/* --- CỘT PHẢI --- */}
                <div className="flex flex-col gap-4">

                    {/* Loại bài thi - 2 Ô CHỌN TO */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">Loại kết quả</label>
                        <div className="flex gap-4">
                            {/* Nút Exam */}
                            <div
                                onClick={() => setAssessmentType("exam")}
                                className={`flex-1 border rounded-md cursor-pointer flex flex-col items-center justify-center transition-all h-[50px] ${assessmentType === "exam"
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <span>📝 Bài kiểm tra</span>
                            </div>

                            {/* Nút Assignment */}
                            <div
                                onClick={() => setAssessmentType("assignment")}
                                className={`flex-1 border rounded-md cursor-pointer flex flex-col items-center justify-center transition-all h-[50px] ${assessmentType === "assignment"
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-sm"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <span>📚 Bài tập về nhà</span>
                            </div>
                        </div>
                    </div>

                    {/* Chọn bài cụ thể */}
                    <div className="flex flex-col gap-2 w-full">
                        <label className="text-xs text-gray-500">
                            {assessmentType === "exam" ? "Chọn bài kiểm tra cụ thể" : "Chọn bài tập cụ thể"}
                        </label>

                        {assessmentType === "exam" ? (
                            <select
                                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full cursor-pointer"
                                {...register("examId")}
                            >
                                <option value="">-- Chọn Exam --</option>
                                {exams?.map((exam: { id: number; title: string }) => (
                                    <option value={exam.id} key={exam.id}>
                                        {exam.title}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full cursor-pointer"
                                {...register("assignmentId")}
                            >
                                <option value="">-- Chọn Assignment --</option>
                                {assignments?.map((assignment: { id: number; title: string }) => (
                                    <option value={assignment.id} key={assignment.id}>
                                        {assignment.title}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

            </div>

            <button
                className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 hover:bg-blue-500 transition-colors w-full mt-4"
                disabled={isPending}
            >
                {isPending ? "Đang xử lý..." : (type === "create" ? "Lưu kết quả" : "Cập nhật")}
            </button>
        </form>
    );
};

export default ResultForm;