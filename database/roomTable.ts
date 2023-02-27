import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";

type RoomSchemaModel = Model<AppModel["Room"]>;

export interface RoomInterface {
  Schema: ModelStatic<RoomSchemaModel>;
  insert: (room: Omit<AppModel["Room"], "id">) => Promise<AppModel["Room"]>;
  searchById: (id: string) => Promise<AppModel["Room"]>;
}

export async function createTable(
  sequelize: Sequelize
): Promise<RoomInterface> {
  const RoomSchema = sequelize.define<RoomSchemaModel>(
    "Room",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      roomNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      schema: "express_task",
    }
  );

  await RoomSchema.sync();
  return {
    Schema: RoomSchema,
    async insert(room) {
      const result = await RoomSchema.create(room as AppModel["Room"]);
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await RoomSchema.findByPk(id);
      if (!result) {
        throw new Error(`Room ID: ${id} not found.`);
      }
      return result.toJSON();
    },
  };
}

export type CourseTable = Awaited<ReturnType<typeof createTable>>;
