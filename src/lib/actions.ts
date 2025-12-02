"use server";

import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { AnnouncementSchema, ClassSchema, EventSchema, ExamSchema, ParentSchema, StudentSchema, SubjectSchema, TeacherSchema } from "./formValidationSchemas";
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
                bloodType: data.bloodType || "",
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

// ... (phần imports và createTeacher giữ nguyên)

export const updateTeacher = async (
    currentState: CurrentState,
    data: any
) => {
    if (!data.id) {
        return { success: false, error: true, message: "Không tìm thấy ID giáo viên!" };
    }

    try {
        const client = await clerkClient();

        // 1. Cập nhật Clerk
        await client.users.updateUser(data.id, {
            username: data.username,
            ...(data.password !== "" && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
        });

        // 2. Xử lý ngày sinh an toàn
        const birthDate = new Date(data.birthday);
        if (isNaN(birthDate.getTime())) {
            return { success: false, error: true, message: "Ngày sinh không hợp lệ!" };
        }

        // 3. Cập nhật Prisma
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
                bloodType: data.bloodType || "",
                sex: data.sex,
                birthday: birthDate,

                // SỬA: Logic cập nhật môn học an toàn hơn
                // Luôn cập nhật lại danh sách môn học (xóa cũ, thêm mới bằng 'set')
                subjects: {
                    set: data.subjects?.map((subjectId: string) => ({
                        id: parseInt(subjectId),
                    })) || [], // Nếu không có môn nào (dù schema đã bắt buộc), trả về mảng rỗng để tránh lỗi crash
                },
            },
        });

        revalidatePath("/list/teachers");
        return { success: true, error: false, message: "Cập nhật thành công!" };

    } catch (err: any) {
        console.log("UPDATE TEACHER ERROR:", JSON.stringify(err, null, 2));

        // ... (các đoạn bắt lỗi khác giữ nguyên)
        if (err.code === "P2025") return { success: false, error: true, message: "Không tìm thấy giáo viên!" };

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

// --- ANNOUNCEMENT ACTIONS ---
export const createAnnouncement = async (
    currentState: CurrentState,
    data: AnnouncementSchema
) => {
    try {
        await prisma.announcement.create({
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                classId: data.classId || null,
            },
        });

        // revalidatePath("/list/announcements");
        return { success: true, error: false, message: "Tạo thông báo thành công!" };
    } catch (err) {
        console.log("CREATE ANNOUNCEMENT ERROR:", err);
        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const updateAnnouncement = async (
    currentState: CurrentState,
    data: AnnouncementSchema
) => {
    try {
        await prisma.announcement.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                description: data.description,
                date: data.date,
                classId: data.classId || null,
            },
        });

        // revalidatePath("/list/announcements");
        return { success: true, error: false, message: "Cập nhật thành công!" };
    } catch (err) {
        console.log("UPDATE ANNOUNCEMENT ERROR:", err);
        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const deleteAnnouncement = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        await prisma.announcement.delete({
            where: {
                id: parseInt(id),
            },
        });

        // revalidatePath("/list/announcements");
        return { success: true, error: false, message: "Xóa thông báo thành công!" };
    } catch (err) {
        console.log("DELETE ANNOUNCEMENT ERROR:", err);
        return { success: false, error: true, message: "Không thể xóa thông báo này!" };
    }
};

// --- EVENT ACTIONS ---
export const createEvent = async (
    currentState: CurrentState,
    data: EventSchema
) => {
    try {
        await prisma.event.create({
            data: {
                title: data.title,
                description: data.description || "",
                startTime: data.startTime,
                endTime: data.endTime,
                classId: data.classId || null,
            },
        });

        // revalidatePath("/list/events");
        return { success: true, error: false, message: "Tạo sự kiện thành công!" };
    } catch (err) {
        console.log("CREATE EVENT ERROR:", err);
        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const updateEvent = async (
    currentState: CurrentState,
    data: EventSchema
) => {
    try {
        await prisma.event.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                description: data.description || "",
                startTime: data.startTime,
                endTime: data.endTime,
                classId: data.classId || null,
            },
        });

        // revalidatePath("/list/events");
        return { success: true, error: false, message: "Cập nhật thành công!" };
    } catch (err) {
        console.log("UPDATE EVENT ERROR:", err);
        return { success: false, error: true, message: "Đã có lỗi xảy ra!" };
    }
};

export const deleteEvent = async (
    currentState: CurrentState,
    data: FormData
) => {
    const id = data.get("id") as string;
    try {
        await prisma.event.delete({
            where: {
                id: parseInt(id),
            },
        });

        // revalidatePath("/list/events");
        return { success: true, error: false, message: "Xóa sự kiện thành công!" };
    } catch (err) {
        console.log("DELETE EVENT ERROR:", err);
        return { success: false, error: true, message: "Không thể xóa sự kiện này!" };
    }
};