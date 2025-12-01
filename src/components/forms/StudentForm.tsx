"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    // 1. Load dữ liệu cũ vào form và format ngày tháng
    defaultValues: data ? {
      ...data,
      birthday: data.birthday
        ? new Date(data.birthday).toISOString().split("T")[0]
        : undefined,
    } : undefined
  });

  const [img, setImg] = useState<any>();
  // 2. Dùng useTransition thay vì useFormState
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    // 1. Logic xử lý ảnh: Nếu có ảnh mới (img state) thì lấy, 
    // nếu không thì lấy ảnh cũ từ database (data?.img)
    const finalImg = img?.secure_url || data?.img;

    const submittedData = {
      ...formData,
      // Chuyển Date thành chuỗi
      birthday: formData.birthday
        ? new Date(formData.birthday).toISOString()
        : undefined,
      // Gán ảnh đã xử lý vào
      img: finalImg,
    };

    startTransition(async () => {
      const action = type === "create" ? createStudent : updateStudent;
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

  const { grades, classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo học viên mới" : "Cập nhật học viên"}
      </h1>

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
          label="Mật khẩu"
          name="password"
          type="password"
          // Mật khẩu không nên để default value
          register={register}
          error={errors?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Thông tin người dùng
      </span>

      {/* Upload Ảnh */}
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

        {/* Parent ID: Bạn phải nhập đúng ID của Parent có trong DB */}
        <InputField
          label="Mã phụ huynh"
          name="parentId"
          defaultValue={data?.parentId}
          register={register}
          error={errors.parentId}
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
          // Không cần defaultValue vì đã có trong useForm
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
          <label className="text-xs text-gray-500">Cấp bậc</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
          >
            {grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lớp học</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
          >
            {classes.map(
              (classItem: {
                id: number;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  (Lớp {classItem.name} -{" "} Sỉ số {" "}
                  {classItem._count.students + "/" + classItem.capacity}
                  )
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
      </div>

      <button
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200"
        disabled={isPending}
      >
        {isPending ? "Đang xử lý..." : (type === "create" ? "Tạo học viên mới" : "Cập nhật học viên")}
      </button>
    </form>
  );
};

export default StudentForm;