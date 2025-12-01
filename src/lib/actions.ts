"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { ClassSchema, ExamSchema, ParentSchema, StudentSchema, SubjectSchema, TeacherSchema } from "./formValidationSchemas";
import { clerkClient } from "@clerk/nextjs/server";


type CurrentState = { success: boolean; error: boolean; message?: string };

export const createSubject = async (
    currentState: CurrentState,
    data: SubjectSchema
) => {
    try {
        await prisma.subject.create({
            data: {
                name: data.name,
                teachers: {
                    connect: data.teachers.map((teacherId) => ({ id: teacherId })),
                },
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const updateSubject = async (
    currentState: CurrentState,
    data: SubjectSchema
) => {
    try {
        await prisma.subject.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                teachers: {
                    set: data.teachers.map((teacherId) => ({ id: teacherId })),
                },
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const deleteSubject = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        await prisma.subject.delete({
            where: {
                id: parseInt(id),
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
    try {
        await prisma.class.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                gradeId: data.gradeId,
                supervisorId: data.supervisorId || null,
            },
        });

        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
    try {
        await prisma.class.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                capacity: data.capacity,
                gradeId: data.gradeId,
                supervisorId: data.supervisorId || null,
            },
        });

        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};


export const deleteClass = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        await prisma.class.delete({
            where: {
                id: parseInt(id),
            },
        });

        // revalidatePath("/list/class");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const createTeacher = async (
    currentState: CurrentState,
    data: TeacherSchema
) => {
    try {
        const client = await clerkClient();

        // Tạo user trên Clerk
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" }
        });

        // Tạo user trên Prisma
        await prisma.teacher.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: new Date(data.birthday), // Đảm bảo chuyển đổi Date
                subjects: {
                    connect: data.subjects?.map((subjectId: string) => ({
                        id: parseInt(subjectId),
                    })),
                },
            },
        });

        // revalidatePath("/list/teachers");
        // SỬA: Thêm message vào kết quả trả về
        return { success: true, error: false, message: "Tạo giáo viên thành công!" };
    } catch (err: any) {
        console.log(err);

        // Bắt lỗi trùng lặp Clerk
        if (err?.errors?.[0]?.code === 'form_identifier_exists') {
            return { success: false, error: true, message: "Username hoặc Email đã tồn tại!" };
        }

        // Bắt lỗi trùng lặp Prisma
        if (err.code === "P2002") {
            return { success: false, error: true, message: "Dữ liệu (SĐT/Email) bị trùng lặp!" };
        }

        return { success: false, error: true, message: "Đã có lỗi xảy ra khi tạo giáo viên!" };
    }
};
// actions.ts

export const updateTeacher = async (
    currentState: CurrentState,
    data: any // SỬA QUAN TRỌNG: Đổi thành 'any' để nhận chuỗi ngày sinh từ Client
) => {
    // 1. Kiểm tra ID bắt buộc
    if (!data.id) {
        return { success: false, error: true, message: "Không tìm thấy ID giáo viên!" };
    }

    try {
        // Log dữ liệu nhận được để debug (có thể xóa sau khi chạy ổn)
        console.log("UPDATE TEACHER DATA RECEIVED:", {
            id: data.id,
            birthdayType: typeof data.birthday,
            birthdayValue: data.birthday
        });

        const client = await clerkClient();

        // 2. Cập nhật Clerk (Username, Password, Name)
        // Lưu ý: Chỉ update password nếu người dùng có nhập
        await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        // 3. Xử lý dữ liệu an toàn trước khi lưu vào Prisma

        // Chuyển đổi ngày sinh từ Chuỗi/Date sang Date Object chuẩn cho Prisma
        const birthDate = new Date(data.birthday);
        if (isNaN(birthDate.getTime())) {
            return { success: false, error: true, message: "Ngày sinh không hợp lệ!" };
        }

        // 4. Cập nhật Prisma
        await prisma.teacher.update({
            where: {
                id: data.id,
            },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,

                // Dùng biến birthDate đã xử lý ở trên
                birthday: birthDate,

                // Xử lý Môn học (Many-to-Many)
                subjects: data.subjects ? {
                    set: data.subjects.map((subjectId: string) => ({
                        id: parseInt(subjectId),
                    })),
                } : undefined,
            },
        });

        // 5. Làm mới cache
        revalidatePath("/list/teachers");

        console.log("UPDATE TEACHER SUCCESS"); // Báo hiệu server đã chạy xong

        return { success: true, error: false, message: "Cập nhật thành công!" };

    } catch (err: any) {
        console.log("UPDATE TEACHER ERROR:", JSON.stringify(err, null, 2));

        // --- XỬ LÝ CÁC LỖI THƯỜNG GẶP ---

        // 1. Lỗi Prisma: Không tìm thấy bản ghi (P2025)
        if (err.code === "P2025") {
            return { success: false, error: true, message: "Không tìm thấy giáo viên trong hệ thống!" };
        }

        // 2. Lỗi Prisma: Trùng lặp dữ liệu (P2002)
        if (err.code === "P2002") {
            const target = err.meta?.target;
            if (Array.isArray(target)) {
                if (target.includes("phone")) return { success: false, error: true, message: "Số điện thoại đã được sử dụng!" };
                if (target.includes("email")) return { success: false, error: true, message: "Email đã được sử dụng!" };
                if (target.includes("username")) return { success: false, error: true, message: "Tên đăng nhập đã tồn tại!" };
            }
            return { success: false, error: true, message: "Dữ liệu bị trùng lặp!" };
        }

        // 3. Lỗi Clerk: Trùng Username/Email
        if (err?.errors?.[0]?.code === 'form_identifier_exists') {
            return { success: false, error: true, message: "Username hoặc Email đã tồn tại trên hệ thống (Clerk)!" };
        }

        // 4. Lỗi Clerk: Mật khẩu yếu
        if (err?.errors?.[0]?.code === 'form_password_pwned') {
            return { success: false, error: true, message: "Mật khẩu quá yếu hoặc đã bị lộ, vui lòng chọn mật khẩu khác!" };
        }

        // Lỗi khác chưa xác định
        return { success: false, error: true, message: err.message || "Đã có lỗi xảy ra!" };
    }
};

export const deleteTeacher = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();

        await client.users.deleteUser(id);

        await prisma.teacher.delete({
            where: {
                id: id,
            },
        });

        // revalidatePath("/list/teachers");
        // SỬA: Thêm message
        return { success: true, error: false, message: "Xóa giáo viên thành công!" };
    } catch (err) {
        console.log(err);
        return { success: false, error: true, message: "Không thể xóa giáo viên này!" };
    }
};

// src/lib/actions.ts

// ... (Các phần trên giữ nguyên)

// --- STUDENT ACTIONS ---

// src/lib/actions.ts

export const createStudent = async (
    currentState: CurrentState,
    data: StudentSchema
) => {
    let createdClerkUserId: string | null = null; // 1. Biến để lưu ID phòng khi cần xóa

    try {
        const client = await clerkClient();

        // 2. Tạo user trên Clerk
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "student" }
        });

        // Lưu lại ID ngay khi tạo xong
        createdClerkUserId = user.id;

        // 3. Tạo user trên Prisma
        await prisma.student.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,
                img: data.img || null,
                bloodType: data.bloodType,
                sex: data.sex,
                birthday: new Date(data.birthday),
                gradeId: data.gradeId,
                classId: data.classId,
                parentId: data.parentId,
            },
        });

        return { success: true, error: false, message: "Tạo học viên thành công!" };
    } catch (err: any) {
        console.log("CREATE STUDENT ERROR:", err);

        // --- CƠ CHẾ ROLLBACK (QUAN TRỌNG) ---
        // Nếu đã tạo được user bên Clerk (createdClerkUserId có giá trị)
        // Nhưng code chạy xuống dòng catch này (nghĩa là lỗi ở bước Prisma)
        // Thì xóa ngay user bên Clerk đi để tránh bị "Zombie User".
        if (createdClerkUserId) {
            try {
                const client = await clerkClient();
                await client.users.deleteUser(createdClerkUserId);
                console.log(`Đã Rollback: Xóa user ${createdClerkUserId} khỏi Clerk do lỗi Prisma.`);
            } catch (rollbackErr) {
                console.error("Lỗi Rollback:", rollbackErr);
            }
        }
        // ------------------------------------

        if (err.code === "P2003") {
            return { success: false, error: true, message: "Mã phụ huynh (Parent ID) không tồn tại!" };
        }
        if (err.code === "P2002") {
            return { success: false, error: true, message: "Dữ liệu (SĐT/Email) bị trùng lặp!" };
        }
        if (err?.errors?.[0]?.code === 'form_identifier_exists') {
            return { success: false, error: true, message: "Username hoặc Email đã tồn tại trên hệ thống!" };
        }

        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const updateStudent = async (
    currentState: CurrentState,
    data: any // SỬA: Dùng 'any' để nhận chuỗi ngày sinh & xử lý ảnh
) => {
    if (!data.id) return { success: false, error: true, message: "Không tìm thấy ID!" };

    try {
        const client = await clerkClient();
        await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        const birthDate = new Date(data.birthday);
        if (isNaN(birthDate.getTime())) return { success: false, error: true, message: "Ngày sinh lỗi!" };

        await prisma.student.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address,

                // QUAN TRỌNG: Logic giữ ảnh cũ đã được xử lý ở Client,
                // Server chỉ cần nhận và lưu. Nếu null thì lưu null.
                img: data.img || null,

                bloodType: data.bloodType,
                sex: data.sex,
                birthday: birthDate,
                gradeId: data.gradeId,
                classId: data.classId,
                parentId: data.parentId,
            },
        });

        // revalidatePath("/list/students");
        return { success: true, error: false, message: "Cập nhật thành công!" };
    } catch (err: any) {
        console.log("UPDATE STUDENT ERROR:", err);
        if (err.code === "P2003") return { success: false, error: true, message: "Mã phụ huynh không tồn tại!" };
        if (err.code === "P2002") return { success: false, error: true, message: "Dữ liệu trùng lặp!" };
        if (err?.errors?.[0]?.code === 'form_identifier_exists') return { success: false, error: true, message: "Username/Email đã tồn tại!" };
        return { success: false, error: true, message: "Lỗi hệ thống!" };
    }
};

export const deleteStudent = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();
        // Xóa Clerk trước
        await client.users.deleteUser(id);
        // Xóa Prisma sau
        await prisma.student.delete({
            where: { id: id },
        });

        // revalidatePath("/list/students");
        return { success: true, error: false, message: "Xóa học viên thành công!" };
    } catch (err) {
        console.log("DELETE STUDENT ERROR:", err);
        return { success: false, error: true, message: "Không thể xóa học viên này!" };
    }
};
export const createExam = async (
    currentState: CurrentState,
    data: ExamSchema
) => {
    // const { userId, sessionClaims } = auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // if (role === "teacher") {
        //   const teacherLesson = await prisma.lesson.findFirst({
        //     where: {
        //       teacherId: userId!,
        //       id: data.lessonId,
        //     },
        //   });

        //   if (!teacherLesson) {
        //     return { success: false, error: true };
        //   }
        // }

        await prisma.exam.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId,
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const updateExam = async (
    currentState: CurrentState,
    data: ExamSchema
) => {
    // const { userId, sessionClaims } = auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // if (role === "teacher") {
        //   const teacherLesson = await prisma.lesson.findFirst({
        //     where: {
        //       teacherId: userId!,
        //       id: data.lessonId,
        //     },
        //   });

        //   if (!teacherLesson) {
        //     return { success: false, error: true };
        //   }
        // }

        await prisma.exam.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId,
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

export const deleteExam = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;

    // const { userId, sessionClaims } = auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        await prisma.exam.delete({
            where: {
                id: parseInt(id),
                // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
            },
        });

        // revalidatePath("/list/subjects");
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};

// ... imports including ParentSchema

// --- PARENT ACTIONS ---

export const createParent = async (
    currentState: CurrentState,
    data: ParentSchema
) => {
    try {
        const client = await clerkClient();
        const user = await client.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "parent" },
        });

        await prisma.parent.create({
            data: {
                id: user.id,
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone,
                address: data.address,
            },
        });

        return { success: true, error: false, message: "Tạo phụ huynh thành công!" };
    } catch (err: any) {
        console.log("CREATE PARENT ERROR:", err);
        if (err.code === "P2002") {
            return { success: false, error: true, message: "Dữ liệu (SĐT/Email) bị trùng lặp!" };
        }
        if (err?.errors?.[0]?.code === 'form_identifier_exists') {
            return { success: false, error: true, message: "Username hoặc Email đã tồn tại!" };
        }
        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const updateParent = async (
    currentState: CurrentState,
    data: ParentSchema
) => {
    if (!data.id) return { success: false, error: true, message: "Không tìm thấy ID!" };

    try {
        const client = await clerkClient();
        await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        await prisma.parent.update({
            where: { id: data.id },
            data: {
                username: data.username,
                name: data.name,
                surname: data.surname,
                email: data.email || null,
                phone: data.phone,
                address: data.address,
            },
        });

        return { success: true, error: false, message: "Cập nhật thành công!" };
    } catch (err: any) {
        console.log("UPDATE PARENT ERROR:", err);
        if (err.code === "P2002") {
            return { success: false, error: true, message: "Dữ liệu bị trùng lặp!" };
        }
        if (err?.errors?.[0]?.code === 'form_identifier_exists') {
            return { success: false, error: true, message: "Username hoặc Email đã tồn tại!" };
        }
        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const deleteParent = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        const client = await clerkClient();

        // SỬA: Bọc lệnh xóa Clerk trong try/catch riêng
        // Để nếu Clerk báo "Not Found" thì code vẫn chạy tiếp xuống dưới để xóa trong DB
        try {
            await client.users.deleteUser(id);
        } catch (clerkErr: any) {
            // Nếu lỗi là do không tìm thấy user, ta bỏ qua để xóa tiếp trong DB
            // Nếu lỗi khác thì log ra xem
            console.log("Clerk delete error (User might not exist):", clerkErr);
        }

        // Xóa trong Database
        await prisma.parent.delete({
            where: { id: id },
        });

        // revalidatePath("/list/parents");
        return { success: true, error: false, message: "Xóa phụ huynh thành công!" };
    } catch (err) {
        console.log("DELETE PARENT ERROR:", err);
        return { success: false, error: true, message: "Không thể xóa phụ huynh này (có thể do ràng buộc dữ liệu)!" };
    }
};