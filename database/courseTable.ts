import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";
// import { ClassDatesInterface } from "./classDatesTable";

type CourseSchemaModel = Model<AppModel["Course"]>;

export interface CourseInterface {
  Schema: ModelStatic<CourseSchemaModel>;
  insert: (
    course: Omit<AppModel["Course"], "id" | "isReady">
  ) => Promise<AppModel["Course"]>;
  searchById: (id: string) => Promise<AppModel["Course"] | undefined>;
}

export async function createTable(
  sequelize: Sequelize
  //   ClassDate: ClassDatesInterface["Schema"]
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

  //   CourseSchema.hasMany(ClassDate);
  //   ClassDate.belongsTo(CourseSchema);

  await CourseSchema.sync();
  return {
    Schema: CourseSchema,
    async insert(course) {
      const result = await CourseSchema.create(course as AppModel["Course"]);
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await CourseSchema.findByPk(id);
      return result?.toJSON();
    },
  };
}

export type CourseTable = Awaited<ReturnType<typeof createTable>>;
