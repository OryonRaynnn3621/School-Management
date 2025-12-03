import { z } from "zod";

//Subjects
export const subjectSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Tên môn học là bắt buộc!" }),
    teachers: z.array(z.string()), // teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

//Classes
export const classSchema = z.object({
    id: z.coerce.number().optional(),
    name: z.string().min(1, { message: "Tên lớp là bắt buộc!" }),
    capacity: z.coerce.number().min(1, { message: "Sĩ số phải lớn hơn 0!" }),
    gradeId: z.coerce.number().min(1, { message: "Cấp bậc học là bắt buộc!" }),
    supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

//Teachers
export const teacherSchema = z.object({
    id: z.string().optional(),
    username: z
        .string()
        .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự!" })
        .max(20, { message: "Tên đăng nhập không được vượt quá 20 ký tự!" }),
    password: z
        .string()
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự!" })
        .optional()
        .or(z.literal("")), // SỬA: Cho phép rỗng để Update không bị lỗi
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
    img: z.string().optional().nullable(),
    bloodType: z.string().optional().or(z.literal("")),
    birthday: z.preprocess((val) => {
        if (typeof val === "string" && val.trim() !== "") {
            return new Date(val);
        }
        return val;
    },
        z.instanceof(Date, { message: "Ngày sinh là bắt buộc!" })
            .refine((date) => !isNaN(date.getTime()), {
                message: "Ngày sinh không hợp lệ!",
            })
    ),
    sex: z.enum(["MALE", "FEMALE"], { message: "Giới tính là bắt buộc!" }),
    subjects: z.array(z.string()).min(1, { message: "Vui lòng chọn ít nhất 1 môn giảng dạy!" }), // subject ids
});
export type TeacherSchema = z.infer<typeof teacherSchema>;

//Students
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
    phone: z
        .string()
        .min(1, { message: "Số điện thoại là bắt buộc!" })
        .regex(/^0\d{9}$/, { message: "Số điện thoại phải có 10 số và bắt đầu bằng số 0!" }),
    address: z.string(),
    img: z.string().optional().nullable(),
    bloodType: z.string(),

    // SỬA: Copy logic xử lý ngày sinh từ Teacher sang
    birthday: z.preprocess((val) => {
        if (typeof val === "string" && val.trim() !== "") {
            return new Date(val);
        }
        return val;
    },
        z.instanceof(Date, { message: "Ngày sinh là bắt buộc!" })
    ),

    sex: z.enum(["MALE", "FEMALE"], { message: "Giới tính là bắt buộc!" }),
    gradeId: z.coerce.number().min(1, { message: "Khối học là bắt buộc!" }),
    classId: z.coerce.number().min(1, { message: "Lớp học là bắt buộc!" }),
    parentId: z.string().min(1, { message: "Mã phụ huynh là bắt buộc!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;


//Exams
export const examSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Tên bài kiểm tra là bắt buộc!" }),
    // SỬA: Xử lý chuỗi ngày tháng từ input datetime-local
    startTime: z.coerce.date({ message: "Thời gian bắt đầu không hợp lệ!" }),
    endTime: z.coerce.date({ message: "Thời gian kết thúc không hợp lệ!" }),
    lessonId: z.coerce.number({ message: "Môn học là bắt buộc!" }),
})
    // THÊM: Validate logic Start < End
    .refine((data) => data.startTime < data.endTime, {
        message: "Thời gian kết thúc phải sau thời gian bắt đầu!",
        path: ["endTime"], // Lỗi sẽ hiện ở ô End Date
    });

export type ExamSchema = z.infer<typeof examSchema>;

//Parents
export const parentSchema = z.object({
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
    phone: z
        .string()
        .min(10, { message: "Số điện thoại không hợp lệ!" }),
    address: z.string().min(1, { message: "Địa chỉ là bắt buộc!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

//Announcement
export const announcementSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Tiêu đề là bắt buộc!" }),
    description: z.string().min(1, { message: "Nội dung là bắt buộc!" }),
    date: z.coerce.date({ message: "Ngày không hợp lệ!" }),
    classId: z.coerce.number().optional().or(z.literal("")),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

//Events
export const eventSchema = z.object({
    id: z.coerce.number().optional(),
    title: z.string().min(1, { message: "Tiêu đề là bắt buộc!" }),
    description: z.string().optional(),
    startTime: z.coerce.date({ message: "Thời gian bắt đầu không hợp lệ!" }),
    endTime: z.coerce.date({ message: "Thời gian kết thúc không hợp lệ!" }),
    classId: z.coerce.number().optional().or(z.literal("")),
})
    .refine((data) => data.startTime < data.endTime, {
        message: "Thời gian kết thúc phải sau thời gian bắt đầu!",
        path: ["endTime"],
    });

export type EventSchema = z.infer<typeof eventSchema>;

// Assignments
export const assignmentSchema = z.object({
    id: z.coerce.number().optional(),
    lessonId: z.coerce.number({ message: "Vui lòng chọn bài học!" }),
    title: z.string().min(1, { message: "Tiêu đề là bắt buộc!" }),
    startDate: z.coerce.date({ message: "Ngày bắt đầu không hợp lệ!" }),
    dueDate: z.coerce.date({ message: "Hạn nộp không hợp lệ!" }),
}).refine((data) => data.startDate < data.dueDate, {
    message: "Hạn nộp phải sau ngày bắt đầu!",
    path: ["dueDate"],
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// Results
export const resultSchema = z.object({
    id: z.coerce.number().optional(),
    studentId: z.string().min(1, { message: "Vui lòng chọn học sinh!" }),
    score: z.coerce.number().min(0, { message: "Điểm số không hợp lệ!" }).max(100, { message: "Điểm tối đa là 100!" }),
    // Dùng .or() để cho phép 1 trong 2 trường có dữ liệu, trường kia null
    examId: z.coerce.number().optional().nullable(),
    assignmentId: z.coerce.number().optional().nullable(),
});

export type ResultSchema = z.infer<typeof resultSchema>;