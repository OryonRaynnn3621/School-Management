"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import { z } from "zod"; // <--- 1. THÊM IMPORT NÀY

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

  // 2. TẠO SCHEMA ĐỘNG: 
  // Nếu là create -> Mật khẩu bắt buộc.
  // Nếu là update -> Giữ nguyên schema gốc (mật khẩu tùy chọn).
  const schema = type === "create"
    ? studentSchema.extend({
      password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự!" })
    })
    : studentSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(schema), // SỬA: Dùng biến 'schema' thay vì 'studentSchema'
    defaultValues: {
      sex: "MALE",
      bloodType: "",
    }
  });

  const [img, setImg] = useState<any>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (type === "update" && data) {
      reset({
        ...data,
        // Xử lý ngày sinh
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : undefined,

        // Xử lý khóa ngoại ClassId
        classId: data.classId ? String(data.classId) : undefined,

        // --- FIX LỖI "Expected string, received null" Ở ĐÂY ---
        // Nếu database trả về null, ta chuyển thành chuỗi rỗng "" để form hiểu
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        // ------------------------------------------------------
      });
    }
  }, [data, type, reset]);

  const onSubmit = handleSubmit((formData) => {
    // ... (Phần logic submit giữ nguyên như cũ)
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
  const inputClass = "ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full h-[40px]";

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Tạo học viên mới" : "Cập nhật học viên"}
      </h1>

      {/* --- PHẦN 1: THÔNG TIN XÁC THỰC --- */}
      <div className="flex flex-col gap-4">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          Thông tin xác thực
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Tài khoản</label>
            <input type="text" {...register("username")} className={inputClass} />
            {errors.username?.message && <p className="text-xs text-red-400">{errors.username.message.toString()}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Email</label>
            <input type="email" {...register("email")} className={inputClass} />
            {errors.email?.message && <p className="text-xs text-red-400">{errors.email.message.toString()}</p>}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Mật khẩu</label>
            <input type="password" {...register("password")} className={inputClass} />
            {errors.password?.message && <p className="text-xs text-red-400">{errors.password.message.toString()}</p>}

            {/* Hiển thị chú thích chỉ khi update */}
            {type === "update" && <span className="text-[10px] text-gray-400 -mt-1">(Để trống nếu không đổi)</span>}
          </div>
        </div>
      </div>

      {/* ... (Các phần còn lại của form giữ nguyên không đổi) ... */}

      {/* --- PHẦN 2: THÔNG TIN CÁ NHÂN --- */}
      <div className="flex flex-col gap-4">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
          Thông tin cá nhân
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Tên</label>
            <input type="text" {...register("name")} className={inputClass} />
            {errors.name?.message && <p className="text-xs text-red-400">{errors.name.message.toString()}</p>}
          </div>
          {/* ... Các trường khác giữ nguyên ... */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Họ</label>
            <input type="text" {...register("surname")} className={inputClass} />
            {errors.surname?.message && <p className="text-xs text-red-400">{errors.surname.message.toString()}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Số điện thoại</label>
            <input type="text" {...register("phone")} className={inputClass} />
            {errors.phone?.message && <p className="text-xs text-red-400">{errors.phone.message.toString()}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Địa chỉ</label>
            <input type="text" {...register("address")} className={inputClass} />
            {errors.address?.message && <p className="text-xs text-red-400">{errors.address.message.toString()}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Ngày sinh</label>
            <input type="date" {...register("birthday")} className={inputClass} />
            {errors.birthday?.message && <p className="text-xs text-red-400">{errors.birthday.message.toString()}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Phụ huynh (Bắt buộc)</label>
            <select className={inputClass} {...register("parentId")}>
              <option value="">-- Chọn phụ huynh --</option>
              {parents?.map((parent: { id: string; name: string; surname: string }) => (
                <option value={parent.id} key={parent.id}>
                  {parent.name} {parent.surname}
                </option>
              ))}
            </select>
            {errors.parentId?.message && <p className="text-xs text-red-400">{errors.parentId.message.toString()}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Giới tính</label>
            <select className={inputClass} {...register("sex")}>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
            </select>
            {errors.sex?.message && <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500">Cấp bậc</label>
            <select className={inputClass} {...register("gradeId")}>
              {grades.map((grade: { id: number; level: number }) => (
                <option value={grade.id} key={grade.id}>
                  {grade.level}
                </option>
              ))}
            </select>
            {errors.gradeId?.message && <p className="text-xs text-red-400">{errors.gradeId.message.toString()}</p>}
          </div>
          {data && <input type="hidden" {...register("id")} defaultValue={data?.id} />}
        </div>
      </div>

      {/* --- PHẦN 3: LỚP HỌC & UPLOAD ẢNH (Giữ nguyên) --- */}
      <div className="flex w-full gap-4 flex-col md:flex-row">
        {/* ... (Code cũ giữ nguyên) ... */}
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Lớp học</label>
          <div className="border border-gray-300 rounded-md p-4 h-40 overflow-y-auto grid grid-cols-2 gap-2 bg-white">
            {classes.map((classItem: { id: number; name: string; capacity: number; _count: { students: number } }) => (
              <div key={classItem.id} className="relative flex items-center">
                <input
                  type="radio"
                  id={`class-${classItem.id}`}
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
          {errors.classId?.message && <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>}
        </div>

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
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200 hover:bg-blue-500 transition-colors w-full"
        disabled={isPending}
      >
        {isPending ? "Đang xử lý..." : (type === "create" ? "Tạo học viên mới" : "Cập nhật học viên")}
      </button>
    </form>
  );
};

export default StudentForm;