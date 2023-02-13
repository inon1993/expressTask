import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";
import { ClassDatesInterface } from "./classDatesTable";

type SyllabusSchemaModel = Model<AppModel["Syllabus"]>;

export interface SyllabusInterface {
  Schema: ModelStatic<SyllabusSchemaModel>;
  insert: (
    course: Omit<AppModel["Syllabus"], "id">
  ) => Promise<AppModel["Syllabus"]>;
  searchById: (id: string) => Promise<AppModel["Syllabus"] | undefined>;
}

export async function createTable(
  sequelize: Sequelize,
  ClassDates: ClassDatesInterface["Schema"]
): Promise<SyllabusInterface> {
  const SyllabusSchema = sequelize.define<SyllabusSchemaModel>(
    "Syllabus",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      classDatesId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: ClassDates,
          key: "id",
        },
      },
    },
    {
      schema: "express_task",
      createdAt: false,
    }
  );

  SyllabusSchema.belongsTo(ClassDates);

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
  };
}

export type CourseTable = Awaited<ReturnType<typeof createTable>>;
