import { z } from "zod";

export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Tên môn học là bắt buộc!" }),
    teachers: z.array(z.string()), // teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Tên lớp là bắt buộc!" }),
    capacity: z.coerce.number().min(1, { message: "Sĩ số phải lớn hơn 0!" }),
    gradeId: z.coerce.number().min(1, { message: "Cấp bậc học là bắt buộc!" }),
    supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự!" })
        .max(20, { message: "Tên đăng nhập không được vượt quá 20 ký tự!" }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự!" }),
    name: z.string().min(1, { message: "Họ là bắt buộc!" }),
    surname: z.string().min(1, { message: "Tên là bắt buộc!" }),
    email: z
        .string()
        .email({ message: "Email không hợp lệ!" })
        .optional()
        .or(z.literal("")),
    phone: z
        .string()
        .min(1, { message: "Số điện thoại là bắt buộc!" })
        .regex(/^0\d{9}$/, { message: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!" }),

    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string(),
    birthday: z.coerce.date({ message: "Ngày sinh là bắt buộc!" }),
    sex: z.enum(["MALE", "FEMALE"], { message: "Giới tính là bắt buộc!" }),
    subjects: z.array(z.string()).optional(), // subject ids
});
export const teacherCreateSchema = teacherSchema.extend({
    password: z.string().min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự!" }),
});

export const teacherUpdateSchema = teacherSchema.extend({
    password: z.string().optional(),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự!" })
        .max(20, { message: "Tên đăng nhập không được vượt quá 20 ký tự!" }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự!" })
        .optional()
        .or(z.literal("")),
    name: z.string().min(1, { message: "Họ là bắt buộc!" }),
    surname: z.string().min(1, { message: "Tên là bắt buộc!" }),
    email: z
        .string()
        .email({ message: "Email không hợp lệ!" })
        .optional()
        .or(z.literal("")),
    phone: z.string().optional(),
    address: z.string(),
    img: z.string().optional(),
    bloodType: z.string().min(1, { message: "Nhóm máu là bắt buộc!" }),
    birthday: z.coerce.date({ message: "Ngày sinh là bắt buộc!" }),
    sex: z.enum(["MALE", "FEMALE"], { message: "Giới tính là bắt buộc!" }),
    gradeId: z.coerce.number().min(1, { message: "Khối học là bắt buộc!" }),
    classId: z.coerce.number().min(1, { message: "Lớp học là bắt buộc!" }),
    parentId: z.string().min(1, { message: "Mã phụ huynh là bắt buộc!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Tên bài kiểm tra là bắt buộc!" }),
    startTime: z.coerce.date({ message: "Thời gian bắt đầu là bắt buộc!" }),
    endTime: z.coerce.date({ message: "Thời gian kết thúc là bắt buộc!" }),
    lessonId: z.coerce.number({ message: "Môn học là bắt buộc!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;
