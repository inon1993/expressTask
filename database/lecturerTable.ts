import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";
import * as errorMsg from "../utils/errorMessages";

type LecturerSchemaModel = Model<AppModel["Lecturer"]>;

export interface LecturerInterface {
  Schema: ModelStatic<LecturerSchemaModel>;
  insert: (
    course: Omit<AppModel["Lecturer"], "id">
  ) => Promise<AppModel["Lecturer"]>;
  delete: (id: string) => Promise<boolean>;
  searchById: (id: string) => Promise<AppModel["Lecturer"] | undefined>;
}

export async function createTable(
  sequelize: Sequelize
): Promise<LecturerInterface> {
  const LecturerSchema = sequelize.define<LecturerSchemaModel>(
    "Lecturer",
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

  await LecturerSchema.sync();
  return {
    Schema: LecturerSchema,
    async insert(lecturer) {
      const result = await LecturerSchema.create(
        lecturer as AppModel["Lecturer"]
      );
      return result.toJSON();
    },
    async delete(id: string) {
      await LecturerSchema.destroy({
        where: { id: id },
      });
      return true;
    },
    async searchById(id: string) {
      const result = await LecturerSchema.findByPk(id);
      if (!result) {
        throw new Error(errorMsg.notFound("Lecturer", id));
      }
      return result.toJSON();
    },
  };
}

export type CourseTable = Awaited<ReturnType<typeof createTable>>;
