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
  ) => Promise<
    // (AppModel["Course"] & {
    //   ClassDates: Array<AppModel["ClassDates"]>;
    // })[]
    AppModel["Course"][]
  >;
  getLecturerSchedule: (
    lecturerId: string,
    startDate: Date,
    endDate: Date
  ) => Promise<AppModel["ClassDates"][]>;
  delete: (id: string) => Promise<boolean>;
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

  Course.hasMany(ClassDatesSchema, { foreignKey: "courseId" });
  ClassDatesSchema.belongsTo(Course, { foreignKey: "courseId" });
  Lecturer.hasMany(ClassDatesSchema, { foreignKey: "lecturerId" });
  ClassDatesSchema.belongsTo(Lecturer, { foreignKey: "lecturerId" });
  Syllabus.hasMany(ClassDatesSchema, { foreignKey: "syllabusId" });
  ClassDatesSchema.belongsTo(Syllabus, { foreignKey: "syllabusId" });
  Room.hasMany(ClassDatesSchema, { foreignKey: "roomId" });
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
      const lecturer = await Lecturer.findByPk(lecturerId);
      if (!lecturer) {
        throw new Error(`Lecturer with ID ${lecturerId} not found`);
      }
      const coursesData = await Course.findAll({
        attributes: ["courseName"],
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
      const lecturer = await Lecturer.findByPk(lecturerId);
      if (!lecturer) {
        throw new Error(`Lecturer with ID ${lecturerId} not found`);
      }
      const coursesData = await Course.findAll({
        // attributes: ["courseName"],
        include: [
          {
            model: ClassDatesSchema,
            // attributes: ["date"],
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

      // const courses: (AppModel["Course"] & {
      //   ClassDates: Array<AppModel["ClassDates"]>;
      // })[] = coursesData.map((c) =>
      //   c.toJSON<
      //     AppModel["Course"] & { ClassDates: AppModel["ClassDates"][] }
      //   >()
      // );
      const courses = coursesData.map((c) => c.toJSON());

      return courses;
    },
    async getLecturerSchedule(
      lecturerId: string,
      startDate: Date,
      endDate: Date
    ) {
      const lecturer = await Lecturer.findByPk(lecturerId);
      if (!lecturer) {
        throw new Error(`Lecturer with ID ${lecturerId} not found`);
      }
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
  };
}

export type ClassDatesTable = Awaited<ReturnType<typeof createTable>>;
