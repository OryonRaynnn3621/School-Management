import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
    table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
    type: "create" | "update" | "delete";
    data?: any;
    id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
    let relatedData = {};

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = userId;

    if (type !== "delete") {
        switch (table) {
            case "subject":
                const subjectTeachers = await prisma.teacher.findMany({
                    select: { id: true, name: true, surname: true },
                });
                relatedData = { teachers: subjectTeachers };
                break;
            case "class":
                const classGrades = await prisma.grade.findMany({
                    select: { id: true, level: true },
                });
                const classTeachers = await prisma.teacher.findMany({
                    select: { id: true, name: true, surname: true },
                });
                relatedData = { teachers: classTeachers, grades: classGrades };
                break;
            case "teacher":
                const teacherSubjects = await prisma.subject.findMany({
                    select: { id: true, name: true },
                });
                relatedData = { subjects: teacherSubjects };
                break;
            case "student":
                const studentGrades = await prisma.grade.findMany({
                    select: { id: true, level: true },
                });
                const studentClasses = await prisma.class.findMany({
                    include: { _count: { select: { students: true } } },
                });
                const studentParents = await prisma.parent.findMany({
                    select: { id: true, name: true, surname: true },
                });
                relatedData = { classes: studentClasses, grades: studentGrades, parents: studentParents };
                break;
            case "exam":
                const examLessons = await prisma.lesson.findMany({
                    where: {
                        ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
                    },
                    select: { id: true, name: true },
                });
                relatedData = { lessons: examLessons };
                break;
            case "announcement":
                const announcementClasses = await prisma.class.findMany({
                    select: { id: true, name: true },
                });
                relatedData = { classes: announcementClasses };
                break;
            case "event":
                // Fetch classes for the dropdown
                const eventClasses = await prisma.class.findMany({
                    select: { id: true, name: true },
                });
                relatedData = { classes: eventClasses };
                break;
            default:
                break;
            case "assignment":
                // Lấy danh sách bài học để chọn
                const assignmentLessons = await prisma.lesson.findMany({
                    where: {
                        // Nếu là giáo viên thì chỉ thấy bài học của mình
                        ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
                    },
                    select: { id: true, name: true },
                });
                relatedData = { lessons: assignmentLessons };
                break;
            case "result":
                // 1. Lấy danh sách Học sinh
                const resultStudents = await prisma.student.findMany({
                    select: { id: true, name: true, surname: true },
                });
                // 2. Lấy danh sách Exams (có thể lọc theo giáo viên nếu cần)
                const resultExams = await prisma.exam.findMany({
                    where: {
                        // ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
                    },
                    select: { id: true, title: true },
                });
                // 3. Lấy danh sách Assignments
                const resultAssignments = await prisma.assignment.findMany({
                    where: {
                        // ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
                    },
                    select: { id: true, title: true },
                });

                relatedData = {
                    students: resultStudents,
                    exams: resultExams,
                    assignments: resultAssignments
                };
                break;
            case "lesson":
                // Lấy danh sách Môn học
                const lessonSubjects = await prisma.subject.findMany({
                    select: { id: true, name: true },
                });
                // Lấy danh sách Lớp học
                const lessonClasses = await prisma.class.findMany({
                    select: { id: true, name: true },
                });
                // Lấy danh sách Giảng viên
                const lessonTeachers = await prisma.teacher.findMany({
                    select: { id: true, name: true, surname: true },
                });

                relatedData = {
                    subjects: lessonSubjects,
                    classes: lessonClasses,
                    teachers: lessonTeachers
                };
                break;
            case "attendance":
                const attendanceStudents = await prisma.student.findMany({
                    select: { id: true, name: true, surname: true },
                });
                const attendanceLessons = await prisma.lesson.findMany({
                    select: {
                        id: true,
                        name: true,
                        class: { select: { name: true } } // Lấy thêm tên lớp để dễ chọn
                    },
                });
                relatedData = { students: attendanceStudents, lessons: attendanceLessons };
                break;
        }
    }

    return (
        <div className="">
            <FormModal
                table={table}
                type={type}
                data={data}
                id={id}
                relatedData={relatedData}
            />
        </div>
    );
};

export default FormContainer;