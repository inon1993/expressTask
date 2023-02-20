import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";
import { CourseInterface } from "./courseTable";

type SyllabusSchemaModel = Model<AppModel["Syllabus"]>;

export interface SyllabusInterface {
  Schema: ModelStatic<SyllabusSchemaModel>;
  insert: (
    course: Omit<AppModel["Syllabus"], "id">
  ) => Promise<AppModel["Syllabus"]>;
  searchById: (id: string) => Promise<AppModel["Syllabus"] | undefined>;
  delete: (id: string) => Promise<boolean>;
}

export async function createTable(
  sequelize: Sequelize,
  Course: CourseInterface["Schema"]
): Promise<SyllabusInterface> {
  const SyllabusSchema = sequelize.define<SyllabusSchemaModel>(
    "Syllabus",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      references: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
      },
    },
    {
      schema: "express_task",
    }
  );

  Course.hasMany(SyllabusSchema, { foreignKey: "courseId" });
  SyllabusSchema.belongsTo(Course, { foreignKey: "courseId" });

  await SyllabusSchema.sync();
  return {
    Schema: SyllabusSchema,
    async insert(syllabus) {
      const result = await SyllabusSchema.create(
        syllabus as AppModel["Syllabus"]
      );
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await SyllabusSchema.findByPk(id);
      return result?.toJSON();
    },
    async delete(id: string) {
      await SyllabusSchema.destroy({
        where: { id: id },
      });
      return true;
    },
  };
}

export type CourseTable = Awaited<ReturnType<typeof createTable>>;
