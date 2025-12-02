"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
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
    reset,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      sex: "MALE",
      bloodType: "",
    }
  });

  const [img, setImg] = useState<any>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // --- SỬA Ở ĐÂY: Dùng useEffect để nạp dữ liệu cũ ---
  useEffect(() => {
    if (type === "update" && data) {
      reset({
        ...data,
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : undefined,
        // QUAN TRỌNG: Ép kiểu classId thành chuỗi (String) để khớp với ô Radio
        classId: data.classId ? String(data.classId) : undefined,
      });
      // Set ảnh cũ nếu có để hiển thị preview (tuỳ chọn)
      // setImg(data.img);
    }
  }, [data, type, reset]);
  // ------------------------------------------------

  const onSubmit = handleSubmit((formData) => {
    const submittedData = {
      ...formData,
      birthday: formData.birthday
        ? new Date(formData.birthday).toISOString()
        : undefined,
      img: img?.secure_url || data?.img,
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

  const { grades, classes, parents } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo học viên mới" : "Cập nhật học viên"}
      </h1>

      {/* --- PHẦN 1: THÔNG TIN XÁC THỰC --- */}

      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
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


      {/* --- PHẦN 2: THÔNG TIN CÁ NHÂN (Đầy đủ các trường) --- */}

      <span className="text-xs text-gray-400 font-medium">
        Thông tin cá nhân
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
      </div>


      {/* --- PHẦN 3: LỚP HỌC & UPLOAD ẢNH --- */}

      <div className="flex w-full gap-4 flex-col md:flex-row">

        {/* Chọn Lớp Học */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Lớp học</label>

          <div className="border border-gray-300 rounded-md p-4 h-40 overflow-y-auto grid grid-cols-2 gap-2 bg-white">
            {classes.map((classItem: { id: number; name: string; capacity: number; _count: { students: number } }) => (
              <div key={classItem.id} className="relative flex items-center">
                <input
                  type="radio"
                  id={`class-${classItem.id}`}
                  // SỬA Ở ĐÂY: Ép kiểu ID thành chuỗi để so sánh chính xác với classId trong reset()
                  value={String(classItem.id)}
                  {...register("classId")}
                  className="peer hidden"
                />
                <label
                  htmlFor={`class-${classItem.id}`}
                  className="w-full text-center text-xs font-medium p-2 border border-gray-200 rounded-md cursor-pointer transition-all 
                             hover:bg-gray-50 
                             peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700"
                >
                  {classItem.name} ({classItem._count.students}/{classItem.capacity})
                </label>
              </div>
            ))}
          </div>

          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
          <p className="text-[10px] text-gray-400">
            * Chọn lớp học cho học viên.
          </p>
        </div>

        {/* Upload Ảnh */}
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