import { Model, Sequelize, DataTypes, ModelStatic, Op } from "sequelize";
import { Model as AppModel } from "../models";
import { CourseInterface } from "./courseTable";
import { StudentInterface } from "./studentTable";

type StudentCoursesSchemaModel = Model<AppModel["StudentCourses"]>;

export interface StudentCoursesInterface {
  Schema: ModelStatic<StudentCoursesSchemaModel>;
  insert: (
    studentCourses: Omit<AppModel["StudentCourses"], "id">
  ) => Promise<AppModel["StudentCourses"]>;
  searchById: (id: string) => Promise<AppModel["StudentCourses"] | undefined>;
  delete: (id: string) => Promise<void>;
  addStudentToCourseIfAvailable: (
    studentId: string,
    courseIdL: string
  ) => Promise<AppModel["StudentCourses"]>;
  //   searchLecturerCourses: (
  //     lecturerId: string,
  //     startDate: Date,
  //     endDate: Date
  //   ) => Promise<AppModel["Course"][]>;
  //   getLecturerSchedule: (
  //     lecturerId: string,
  //     startDate: Date,
  //     endDate: Date
  //   ) => Promise<AppModel["ClassDates"][]>;
}

export async function createTable(
  sequelize: Sequelize,
  Course: CourseInterface["Schema"],
  Student: StudentInterface["Schema"]
): Promise<StudentCoursesInterface> {
  const StudentCoursesSchema = sequelize.define<StudentCoursesSchemaModel>(
    "StudentCourses",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      schema: "express_task",
    }
  );

  Course.belongsToMany(Student, {
    through: StudentCoursesSchema,
    foreignKey: "courseId",
  });
  Student.belongsToMany(Course, {
    through: StudentCoursesSchema,
    foreignKey: "studentId",
  });

  await StudentCoursesSchema.sync();
  return {
    Schema: StudentCoursesSchema,
    async insert(studentCourses) {
      const result = await StudentCoursesSchema.create(
        studentCourses as AppModel["StudentCourses"]
      );
      return result.toJSON();
    },
    async delete(id: string) {
      await StudentCoursesSchema.destroy({
        where: { id: id },
      });
    },
    async searchById(id: string) {
      const result = await StudentCoursesSchema.findByPk(id);
      return result?.toJSON();
    },
    async addStudentToCourseIfAvailable(
      studentId: string,
      courseId: string
    ): Promise<AppModel["StudentCourses"]> {
      const student = await Student.findByPk(studentId, {
        include: [Course],
      });
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found.`);
      }

      const newCourse = await Course.findByPk(courseId);
      if (!newCourse) {
        throw new Error(`Course with ID ${courseId} not found.`);
      }

      const s: any = student.toJSON();
      const c = newCourse.toJSON();

      const numOfStudentsInCourse = await StudentCoursesSchema.count({
        where: {
          courseId: courseId,
        },
      });

      if (numOfStudentsInCourse >= c.maximumStudents) {
        throw new Error(`Course ID: ${courseId} is full.`);
      }

      const courses = s.Courses;
      for (const course of courses) {
        if (
          course.startingTime <= c.endDate &&
          course.endTime >= c.startingDate
        ) {
          throw new Error(
            "Student is already enrolled in a course during the specified time period"
          );
        }
      }

      const result = await StudentCoursesSchema.create({
        studentId: studentId,
        courseId: courseId,
      } as AppModel["StudentCourses"]);

      return result.toJSON();
    },
    // async searchLecturerCourses(
    //   lecturerId: string,
    //   startDate: Date,
    //   endDate: Date
    // ) {
    //   const lecturer = await Lecturer.findByPk(lecturerId);
    //   if (!lecturer) {
    //     throw new Error(`Lecturer with ID ${lecturerId} not found`);
    //   }
    //   const coursesData = await Course.findAll({
    //     include: [
    //       {
    //         model: ClassDatesSchema,
    //         where: { lecturerId: lecturerId },
    //       },
    //     ],
    //     where: {
    //       startingDate: {
    //         [Op.between]: [startDate, endDate],
    //       },
    //       endDate: {
    //         [Op.between]: [startDate, endDate],
    //       },
    //     },
    //   });

    //   const courses = coursesData.map((c) => c.toJSON());
    //   return courses;
    // },
    // async getLecturerSchedule(
    //   lecturerId: string,
    //   startDate: Date,
    //   endDate: Date
    // ) {
    //   const lecturer = await Lecturer.findByPk(lecturerId);
    //   if (!lecturer) {
    //     throw new Error(`Lecturer with ID ${lecturerId} not found`);
    //   }
    //   const classDatesData = await ClassDatesSchema.findAll({
    //     where: {
    //       lecturerId: lecturerId,
    //       date: {
    //         [Op.between]: [startDate, endDate],
    //       },
    //     },
    //     include: [Course],
    //   });

    //   const classDates = classDatesData.map((cd) => cd.toJSON());
    //   return classDates;
    // },
  };
}

export type ClassDatesTable = Awaited<ReturnType<typeof createTable>>;
