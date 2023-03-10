import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";
import * as errorMsg from "../utils/errorMessages";

type CourseInterfaceOmitted = Omit<
  AppModel["Course"],
  "classDates" | "syllabus"
>;
type CourseSchemaModel = Model<CourseInterfaceOmitted>;

export interface CourseInterface {
  Schema: ModelStatic<CourseSchemaModel>;
  insert: (
    course: Omit<CourseInterfaceOmitted, "id" | "isReady">
  ) => Promise<CourseInterfaceOmitted>;
  searchById: (id: string) => Promise<CourseInterfaceOmitted | undefined>;
  update: (id: string, course: any) => Promise<Array<number>>;
  delete: (id: string) => Promise<boolean>;
  updateReady: (id: string, isReady: boolean) => Promise<Array<number>>;
}

export async function createTable(
  sequelize: Sequelize
): Promise<CourseInterface> {
  const CourseSchema = sequelize.define<CourseSchemaModel>(
    "Course",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      courseName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      startingDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      minimumPassScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maximumStudents: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isReady: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      schema: "express_task",
    }
  );

  await CourseSchema.sync();
  return {
    Schema: CourseSchema,
    async insert(course) {
      const result = await CourseSchema.create(
        course as CourseInterfaceOmitted
      );
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await CourseSchema.findByPk(id);
      if (!result) {
        throw new Error(errorMsg.notFound("Course", id));
      }
      return result.toJSON();
    },
    async update(id: string, course: any) {
      const result = await CourseSchema.update(course, {
        where: {
          id: id,
        },
      });
      return result;
    },
    async delete(id: string) {
      await CourseSchema.destroy({
        where: { id: id },
      });
      return true;
    },
    async updateReady(id: string, isReady: boolean) {
      const data = { isReady: isReady };
      const result = await CourseSchema.update(data, {
        where: {
          id: id,
        },
      });
      return result;
    },
  };
}

export type CourseTable = Awaited<ReturnType<typeof createTable>>;
