import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";

type StudentSchemaModel = Model<AppModel["Student"]>;

export interface StudentInterface {
  Schema: ModelStatic<StudentSchemaModel>;
  insert: (
    student: Omit<AppModel["Student"], "id">
  ) => Promise<AppModel["Student"]>;
  searchById: (id: string) => Promise<AppModel["Student"] | undefined>;
}

export async function createTable(
  sequelize: Sequelize
): Promise<StudentInterface> {
  const StudentSchema = sequelize.define<StudentSchemaModel>(
    "Student",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      schema: "express_task",
    }
  );

  await StudentSchema.sync();
  return {
    Schema: StudentSchema,
    async insert(student) {
      const result = await StudentSchema.create(student as AppModel["Student"]);
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await StudentSchema.findByPk(id);
      return result?.toJSON();
    },
  };
}

export type StudentsTable = Awaited<ReturnType<typeof createTable>>;
