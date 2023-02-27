import { Model, Sequelize, DataTypes, ModelStatic, Op } from "sequelize";
import { Model as AppModel } from "../models";
import { CourseInterface } from "./courseTable";
import { LecturerInterface } from "./lecturerTable";
import { SyllabusInterface } from "./syllabusTable";
import { RoomInterface } from "./roomTable";

type ClassDatesSchemaModel = Model<AppModel["ClassDates"]>;

export interface ClassDatesInterface {
  Schema: ModelStatic<ClassDatesSchemaModel>;
  insert: (
    course: Omit<AppModel["ClassDates"], "id">
  ) => Promise<AppModel["ClassDates"]>;
  searchById: (id: string) => Promise<AppModel["ClassDates"] | undefined>;
  searchLecturerCurrentCourses: (
    lecturerId: string
  ) => Promise<AppModel["Course"][]>;
  searchLecturerCourses: (
    lecturerId: string,
    startDate: Date,
    endDate: Date
  ) => Promise<AppModel["Course"][]>;
  getLecturerSchedule: (
    lecturerId: string,
    startDate: Date,
    endDate: Date
  ) => Promise<AppModel["ClassDates"][]>;
  delete: (id: string) => Promise<boolean>;
  getCourse: (
    id: string,
    fullInfo: boolean
  ) => Promise<
    AppModel["Course"] | Omit<AppModel["Course"], "classDates" | "syllabus">
  >;
  getClassDatesBeforeDate: (
    id: string,
    data: Date
  ) => Promise<AppModel["ClassDates"][]>;
  getClassDatesAfterDate: (
    id: string,
    data: Date
  ) => Promise<AppModel["ClassDates"][]>;
  countClassDates: (id: string) => Promise<number>;
}

export async function createTable(
  sequelize: Sequelize,
  Course: CourseInterface["Schema"],
  Lecturer: LecturerInterface["Schema"],
  Syllabus: SyllabusInterface["Schema"],
  Room: RoomInterface["Schema"]
): Promise<ClassDatesInterface> {
  const ClassDatesSchema = sequelize.define<ClassDatesSchemaModel>(
    "ClassDates",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      startHour: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endHour: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      roomId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      lecturerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      syllabusId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      schema: "express_task",
    }
  );

  Course.hasMany(ClassDatesSchema, {
    foreignKey: "courseId",
    onDelete: "CASCADE",
  });
  ClassDatesSchema.belongsTo(Course, { foreignKey: "courseId" });
  Lecturer.hasMany(ClassDatesSchema, {
    foreignKey: "lecturerId",
    onDelete: "CASCADE",
  });
  ClassDatesSchema.belongsTo(Lecturer, { foreignKey: "lecturerId" });
  Syllabus.hasMany(ClassDatesSchema, {
    foreignKey: "syllabusId",
    onDelete: "CASCADE",
  });
  ClassDatesSchema.belongsTo(Syllabus, { foreignKey: "syllabusId" });
  Room.hasMany(ClassDatesSchema, {
    foreignKey: "roomId",
    onDelete: "CASCADE",
  });
  ClassDatesSchema.belongsTo(Room, { foreignKey: "roomId" });

  await ClassDatesSchema.sync();
  return {
    Schema: ClassDatesSchema,
    async insert(classDate) {
      const course = await Course.findByPk(classDate.courseId);
      if (!course) {
        throw new Error(`Course ID: ${classDate.courseId} not found.`);
      }
      const c = course.toJSON();
      if (classDate.date < c.startingDate || classDate.date > c.endDate) {
        throw new Error(
          `Class date ${classDate.date} doesn't match course dates.`
        );
      }
      const isAvailable = await ClassDatesSchema.findOne({
        where: {
          roomId: classDate.roomId,
          date: classDate.date,
          [Op.or]: [
            {
              startHour: {
                [Op.between]: [classDate.startHour, classDate.endHour],
              },
            },
            {
              endHour: {
                [Op.between]: [classDate.startHour, classDate.endHour],
              },
            },
          ],
        },
      });
      if (isAvailable) {
        throw new Error("Room is not available for given date and times.");
      }
      const isLecturerAvailable = await ClassDatesSchema.findOne({
        where: {
          lecturerId: classDate.lecturerId,
          date: classDate.date,
          [Op.or]: [
            {
              startHour: {
                [Op.between]: [classDate.startHour, classDate.endHour],
              },
            },
            {
              endHour: {
                [Op.between]: [classDate.startHour, classDate.endHour],
              },
            },
          ],
        },
      });

      if (isLecturerAvailable) {
        throw new Error(
          `Lecturer ID: ${classDate.lecturerId} is not available for given date and times.`
        );
      }
      const isClassFinished = await ClassDatesSchema.findOne({
        where: {
          courseId: classDate.courseId,
          date: classDate.date,
          [Op.or]: [
            {
              startHour: {
                [Op.between]: [classDate.startHour, classDate.endHour],
              },
            },
            {
              endHour: {
                [Op.between]: [classDate.startHour, classDate.endHour],
              },
            },
          ],
        },
      });
      if (isClassFinished) {
        throw new Error("Class is not available for given date and time.");
      }
      const result = await ClassDatesSchema.create(
        classDate as AppModel["ClassDates"]
      );
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await ClassDatesSchema.findByPk(id);
      return result?.toJSON();
    },
    async searchLecturerCurrentCourses(lecturerId: string) {
      const coursesData = await Course.findAll({
        include: [
          {
            model: ClassDatesSchema,
            where: { lecturerId: lecturerId },
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

      const courses: AppModel["Course"][] = coursesData.map((c) => c.toJSON());

      return courses;
    },
    async searchLecturerCourses(
      lecturerId: string,
      startDate: Date,
      endDate: Date
    ) {
      const coursesData = await Course.findAll({
        include: [
          {
            model: ClassDatesSchema,
            attributes: [],
            where: { lecturerId: lecturerId },
          },
        ],
        where: {
          startingDate: {
            [Op.between]: [startDate, endDate],
          },
          endDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      const courses = coursesData.map((c) => c.toJSON());

      return courses;
    },
    async getLecturerSchedule(
      lecturerId: string,
      startDate: Date,
      endDate: Date
    ) {
      const classDatesData = await ClassDatesSchema.findAll({
        where: {
          lecturerId: lecturerId,
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [{ model: Course, attributes: ["id", "courseName"] }],
      });

      const classDates = classDatesData.map((cd) => cd.toJSON());
      return classDates;
    },
    async delete(id: string) {
      await ClassDatesSchema.destroy({
        where: { id: id },
      });
      return true;
    },
    async getCourse(id: string, fullInfo: boolean) {
      if (fullInfo) {
        const result = await Course.findByPk(id, {
          include: [
            {
              model: ClassDatesSchema,
              where: {
                courseId: id,
              },
            },
            {
              model: Syllabus,
              where: {
                courseId: id,
              },
            },
          ],
        });

        if (!result) {
          throw new Error(`Course ID: ${id} not found.`);
        }
        const course: AppModel["Course"] = result.toJSON();
        return course;
      } else {
        const result = await Course.findByPk(id);
        if (!result) {
          throw new Error(`Course ID ${id} not found.`);
        }
        const course: Omit<AppModel["Course"], "ClassDates" | "Syllabus"> =
          result.toJSON();
        return course;
      }
    },
    async getClassDatesBeforeDate(id: string, date: Date) {
      const result = await ClassDatesSchema.findAll({
        where: {
          courseId: id,
          date: {
            [Op.lt]: date,
          },
        },
      });
      const dates = result.map((d) => d.toJSON());
      return dates;
    },
    async getClassDatesAfterDate(id: string, date: Date) {
      const result = await ClassDatesSchema.findAll({
        where: {
          courseId: id,
          date: {
            [Op.gt]: date,
          },
        },
      });
      const dates = result.map((d) => d.toJSON());
      return dates;
    },
    async countClassDates(id: string) {
      const num = await ClassDatesSchema.count({
        where: {
          courseId: id,
        },
      });
      return num;
    },
  };
}

export type ClassDatesTable = Awaited<ReturnType<typeof createTable>>;
