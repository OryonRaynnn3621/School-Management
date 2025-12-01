"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState, useTransition } from "react"; // Dùng useState thay vì useFormState
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
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: data ? {
      ...data,
      // Chuyển đổi Date object thành chuỗi "YYYY-MM-DD" để input hiển thị đúng
      birthday: data.birthday
        ? new Date(data.birthday).toISOString().split("T")[0]
        : undefined,
    } : undefined
  });

  const [img, setImg] = useState<any>();
  // SỬA: Dùng useTransition để quản lý trạng thái đang loading
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  // SỬA: Hàm xử lý submit trực tiếp, không qua useFormState
  const onSubmit = handleSubmit((formData: TeacherSchema) => {
    // 1. Chuẩn bị dữ liệu
    const submittedData = {
      ...formData,
      // Chuyển Date thành chuỗi ISO an toàn
      birthday: formData.birthday
        ? new Date(formData.birthday).toISOString()
        : undefined,
      img: img?.secure_url || data?.img,
    };

    // 2. Bắt đầu gọi Server Action
    startTransition(async () => {
      // Chọn action tương ứng
      const action = type === "create" ? createTeacher : updateTeacher;

      try {
        // Gọi trực tiếp (truyền state giả vì action yêu cầu tham số đầu tiên)
        // @ts-ignore
        const result = await action({ success: false, error: false }, submittedData);

        // 3. Xử lý kết quả NGAY LẬP TỨC
        if (result.success) {
          toast.success(`Giảng viên đã được ${type === "create" ? "thêm vào" : "cập nhật"}!`);
          setOpen(false); // Đóng modal ngay
          router.refresh(); // Làm mới dữ liệu
        } else {
          // Hiện lỗi server trả về (ví dụ: trùng SĐT, User không tồn tại...)
          toast.error(result.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
      } catch (err) {
        console.error(err);
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

      {/* --- PHẦN INPUT --- */}
      <span className="text-xs text-gray-400 font-medium">
        Thông tin xác thực
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Tài khoản"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
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
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Thông tin người dùng
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Tên"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Họ"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Số điện thoại"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Địa chỉ"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Nhóm máu"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Ngày tháng năm sinh"
          name="birthday"
          defaultValue={
            data?.birthday
              ? new Date(data.birthday).toISOString().split("T")[0]
              : ""
          }
          register={register}
          error={errors.birthday}
          type="date"
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

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

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Môn giảng dạy</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjects")}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>

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
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={28} height={28} />
                <span>
                  {img ? "Đã chọn ảnh mới" : "Đăng tải hình ảnh"}
                </span>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>

      <button
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 disabled:cursor-not-allowed"
        disabled={isPending} // Disable nút khi đang gửi dữ liệu
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