"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
    reset, // Lấy thêm hàm reset
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    // defaultValues chỉ chạy lần đầu, logic chính sẽ nằm ở useEffect bên dưới
    defaultValues: {
      subjects: [],
    },
  });

  const [img, setImg] = useState<any>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // --- SỬA QUAN TRỌNG: Dùng useEffect để load dữ liệu cũ ---
  // Cách này đảm bảo khi mở form Update, dữ liệu luôn được nạp mới nhất
  useEffect(() => {
    if (type === "update" && data) {
      reset({
        ...data,
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : undefined,
        // Chuyển danh sách môn học thành mảng ID (String) để khớp với checkbox
        subjects: data.subjects
          ? data.subjects.map((subject: { id: number }) => String(subject.id))
          : [],
      });
      // Nếu có ảnh cũ, set vào state để hiển thị (tuỳ chọn)
      // setImg(data.img); 
    }
  }, [data, type, reset]);
  // -------------------------------------------------------

  const onSubmit = handleSubmit((formData) => {
    const submittedData = {
      ...formData,
      birthday: formData.birthday
        ? new Date(formData.birthday).toISOString()
        : undefined,
      img: img?.secure_url || data?.img,
    };

    startTransition(async () => {
      const action = type === "create" ? createTeacher : updateTeacher;

      try {
        // @ts-ignore
        const result = await action({ success: false, error: false }, submittedData);

        if (result.success) {
          toast.success(`Giảng viên đã được ${type === "create" ? "thêm vào" : "cập nhật"}!`);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result.message || "Có lỗi xảy ra!");
        }
      } catch (err) {
        toast.error("Lỗi kết nối đến máy chủ!");
      }
    });
  });

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Thêm giảng viên mới" : "Cập nhật thông tin giảng viên"}
      </h1>

      {/* --- PHẦN 1: THÔNG TIN XÁC THỰC --- */}
      <span className="text-xs text-gray-400 font-medium">
        Thông tin xác thực
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Tài khoản"
          name="username"
          // Bỏ defaultValue, để reset() tự xử lý
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors?.email}
        />

        <InputField
          label="Mật Khẩu"
          name="password"
          type="password"
          register={register}
          error={errors?.password}
        />
        {type === "update" && (
          <span className="text-[10px] text-gray-400 -mt-1">
            (Để trống nếu không muốn đổi)
          </span>
        )}

      </div>

      {/* --- PHẦN 2: THÔNG TIN CÁ NHÂN --- */}
      <span className="text-xs text-gray-400 font-medium">
        Thông tin người dùng
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Tên"
          name="name"
          register={register}
          error={errors.name}
        />
        <InputField
          label="Họ"
          name="surname"
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Số điện thoại"
          name="phone"
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Địa chỉ"
          name="address"
          register={register}
          error={errors.address}
        />

        {/* Giới tính */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Giới tính</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
          >
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Ngày tháng năm sinh"
          name="birthday"
          register={register}
          error={errors.birthday}
          type="date"
        />

        {data && (
          <input type="hidden" value={data.id} {...register("id")} />
        )}

        {/* --- PHẦN 3: MÔN HỌC & UPLOAD ẢNH --- */}

        <div className="flex w-full gap-4 flex-col md:flex-row">

          {/* Subjects Selection */}
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label className="text-xs text-gray-500">Môn giảng dạy</label>

            <div className="border border-gray-300 rounded-md p-4 h-40 overflow-y-auto grid grid-cols-2 gap-2 bg-white">
              {subjects.map((subject: { id: number; name: string }) => (
                <div key={subject.id} className="relative flex items-center">
                  <input
                    type="checkbox"
                    id={`subject-${subject.id}`}
                    // SỬA DÒNG NÀY: Ép kiểu thành String để khớp với dữ liệu trong useEffect
                    value={String(subject.id)}
                    {...register("subjects")}
                    className="peer hidden"
                  />
                  <label
                    htmlFor={`subject-${subject.id}`}
                    className="w-full text-center text-xs font-medium p-2 border border-gray-200 rounded-md cursor-pointer transition-all 
                    hover:bg-gray-50 
                    peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700"
                  >
                    {subject.name}
                  </label>
                </div>
              ))}
            </div>

            {errors.subjects?.message && (
              <p className="text-xs text-red-400">
                {errors.subjects.message.toString()}
              </p>
            )}
            <p className="text-[10px] text-gray-400">
              * Chọn các môn học giảng viên này phụ trách.
            </p>
          </div>

          {/* Image Upload Area */}
          <div className="flex flex-col gap-2 w-full md:w-1/2">
            <label className="text-xs text-gray-500 opacity-0 md:opacity-100">Ảnh đại diện</label>

            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                widget.close();
              }}
            >
              {({ open }) => {
                return (
                  <div
                    className="w-full h-40 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors"
                    onClick={() => open()}
                  >
                    {img ? (
                      <>
                        <Image src="/upload.png" alt="" width={28} height={28} className="mb-2" />
                        <span className="text-xs text-green-600 font-semibold">✅ Đã chọn ảnh mới</span>
                      </>
                    ) : data?.img ? (
                      <>
                        <Image src={data.img} alt="Current" width={40} height={40} className="rounded-full mb-2 object-cover" />
                        <span className="text-xs text-blue-600 font-semibold">🖼️ Giữ ảnh hiện tại</span>
                        <span className="text-[10px] text-gray-400 mt-1">(Nhấp để thay đổi)</span>
                      </>
                    ) : (
                      <>
                        <Image src="/upload.png" alt="" width={28} height={28} className="mb-2 opacity-60" />
                        <span className="text-xs text-gray-500 font-medium">Nhấp để tải ảnh đại diện</span>
                      </>
                    )}
                  </div>
                );
              }}
            </CldUploadWidget>
          </div>
        </div>

      </div>

      <button
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
        disabled={isPending}
      >
        {isPending
          ? "Đang xử lý..."
          : type === "create" ? "Thêm giảng viên mới" : "Cập nhật thông tin giảng viên"
        }
      </button>
    </form>
  );
};

export default TeacherForm;