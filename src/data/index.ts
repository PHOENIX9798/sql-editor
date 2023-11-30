export const TABLE_LIST = {
    "Students": ["StudentID", "Name", "Age", "Gender", "ClassID", "OtherFields"],
    "Teachers": ["TeacherID", "Name", "Age", "Gender", "SubjectTaught", "OtherFields"],
    "Classes": ["ClassID", "ClassName", "Grade", "ClassTeacherID", "OtherFields"],
    "Courses": ["CourseID", "CourseName", "TeacherID", "OtherFields"],
    "Enrollments": ["StudentID", "CourseID", "Grade", "OtherFields"],
    "Departments": ["DepartmentID", "DepartmentName", "DepartmentHeadID", "OtherFields"],
    "Grades": ["StudentID", "CourseID", "Grade", "OtherFields"],
}