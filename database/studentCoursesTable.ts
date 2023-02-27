import {
  Model,
  Sequelize,
  DataTypes,
  ModelStatic,
  Op,
  QueryTypes,
} from "sequelize";
import { Model as AppModel } from "../models";
import { CourseInterface } from "./courseTable";
import { StudentInterface } from "./studentTable";

type StudentCoursesSchemaModel = Model<AppModel["StudentCourses"]>;

export interface StudentCoursesInterface {
  Schema: ModelStatic<StudentCoursesSchemaModel>;
  insert: (
    studentCourses: Omit<AppModel["StudentCourses"], "id">
  ) => Promise<AppModel["StudentCourses"]>;
  searchById: (id: string) => Promise<AppModel["StudentCourses"]>;
  delete: (id: string) => Promise<boolean>;
  addStudentToCourseIfAvailable: (
    studentId: string,
    courseIdL: string
  ) => Promise<AppModel["StudentCourses"]>;
  searchStudentCurrentCourses: (
    studentId: string
  ) => Promise<undefined | AppModel["Course"][]>;
  getStudentsCoursesHistory: (
    studentId: string
  ) => Promise<AppModel["Course"][]>;
  getStudentSchedule: (
    studentId: string,
    afterDate: Date,
    beforeDate: Date
  ) => Promise<Array<AppModel["ClassDates"] & { courseName: string }>>;
  countStudents: (courseId: string) => Promise<number>;
}

export async function createTable(
  sequelize: Sequelize,
  Course: CourseInterface["Schema"],
  Student: StudentInterface["Schema"]
): Promise<StudentCoursesInterface> {
  const StudentCoursesSchema = sequelize.define<StudentCoursesSchemaModel>(
    "StudentCourse",
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
    onDelete: "CASCADE",
  });
  Student.belongsToMany(Course, {
    through: StudentCoursesSchema,
    foreignKey: "studentId",
    onDelete: "CASCADE",
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
      return true;
    },
    async searchById(id: string) {
      const result = await StudentCoursesSchema.findByPk(id);
      if (!result) {
        throw new Error(`StudentCourse ${id} not found.`);
      }
      return result.toJSON();
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

      const isStudentCourse = await StudentCoursesSchema.findOne({
        where: {
          studentId: studentId,
          courseId: courseId,
        },
      });

      if (isStudentCourse) {
        throw new Error("Student is already signed for given course.");
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
    async searchStudentCurrentCourses(studentId: string) {
      const result = await Course.findAll({
        include: [
          {
            model: Student,
            where: { id: studentId },
            attributes: [],
          },
        ],
        where: {
          startingDate: {
            [Op.lte]: new Date(),
          },
          endDate: {
            [Op.gte]: new Date(),
          },
        },
      });
      const courses = result.map((c) => c.toJSON());
      return courses;
    },
    async getStudentsCoursesHistory(studentId: string) {
      const result = await Course.findAll({
        include: [
          {
            model: Student,
            where: { id: studentId },
            attributes: [],
          },
        ],
      });

      const courses = result.map((c) => c.toJSON());
      return courses;
    },
    async getStudentSchedule(
      studentId: string,
      afterDate: Date,
      beforeDate: Date
    ) {
      const befDate = beforeDate.toISOString();
      const aftDate = afterDate.toISOString();
      const result: Array<AppModel["ClassDates"] & { courseName: string }> =
        await sequelize.query(
          `SELECT cd."id", cd."date", cd."startHour", cd."endHour", cd."roomId", cd."lecturerId", cd."courseId", cd."syllabusId", c."courseName"
        FROM express_task."ClassDates" AS cd
        JOIN express_task."Courses" c
        ON cd."courseId" = c."id"
        JOIN express_task."StudentCourses" sc
        ON c."id" = sc."courseId"
        WHERE sc."studentId" = '${studentId}' AND cd."date" BETWEEN '${aftDate}' AND '${befDate}'`,
          { type: QueryTypes.SELECT }
        );
      return result;
    },
    async countStudents(courseId: string) {
      const numOfStudents = await StudentCoursesSchema.count({
        where: {
          courseId: courseId,
        },
      });
      return numOfStudents;
    },
  };
}

export type ClassDatesTable = Awaited<ReturnType<typeof createTable>>;
