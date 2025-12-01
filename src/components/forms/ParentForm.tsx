"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useTransition } from "react";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ParentForm = ({
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
    } = useForm<ParentSchema>({
        resolver: zodResolver(parentSchema),
        defaultValues: data,
    });

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = handleSubmit((formData) => {
        startTransition(async () => {
            const action = type === "create" ? createParent : updateParent;
            try {
                // @ts-ignore
                const result = await action({ success: false, error: false }, formData);

                if (result.success) {
                    toast.success(`Phụ huynh đã được ${type === "create" ? "tạo" : "cập nhật"}!`);
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
                {type === "create" ? "Tạo phụ huynh mới" : "Cập nhật phụ huynh"}
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
                    register={register}
                    error={errors?.password}
                />
            </div>

            <span className="text-xs text-gray-400 font-medium">
                Thông tin cá nhân
            </span>
            <div className="flex justify-between flex-wrap gap-4">
                <InputField
                    label="Họ"
                    name="name"
                    defaultValue={data?.name}
                    register={register}
                    error={errors.name}
                />
                <InputField
                    label="Tên"
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

                {/* Input ẩn chứa ID khi update */}
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
            </div>

            <button
                className="bg-blue-400 text-white p-2 rounded-md disabled:bg-blue-200"
                disabled={isPending}
            >
                {isPending ? "Đang xử lý..." : (type === "create" ? "Tạo" : "Cập nhật")}
            </button>
        </form>
    );
};

export default ParentForm;