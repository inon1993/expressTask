import { Model, Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Model as AppModel } from "../models";
import { CourseInterface } from "./courseTable";
import { LecturerInterface } from "./lecturerTable";

type ClassDatesSchemaModel = Model<AppModel["ClassDates"]>;

export interface ClassDatesInterface {
  Schema: ModelStatic<ClassDatesSchemaModel>;
  insert: (
    course: Omit<AppModel["ClassDates"], "id">
  ) => Promise<AppModel["ClassDates"]>;
  searchById: (id: string) => Promise<AppModel["ClassDates"] | undefined>;
}

export async function createTable(
  sequelize: Sequelize,
  Course: CourseInterface["Schema"],
  Lecturer: LecturerInterface["Schema"]
): Promise<ClassDatesInterface> {
  const ClassDatesSchema = sequelize.define<ClassDatesSchemaModel>(
    "ClassDates",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Course,
          key: "id",
        },
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      startHour: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      endHour: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roomId: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      lecturerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Lecturer,
          key: "id",
        },
      },
    },
    {
      schema: "express_task",
      createdAt: false,
    }
  );

  ClassDatesSchema.belongsTo(Course);
  ClassDatesSchema.belongsTo(Lecturer);

  await ClassDatesSchema.sync();
  return {
    Schema: ClassDatesSchema,
    async insert(classDate) {
      const result = await ClassDatesSchema.create(
        classDate as AppModel["ClassDates"]
      );
      return result.toJSON();
    },
    async searchById(id: string) {
      const result = await ClassDatesSchema.findByPk(id);
      return result?.toJSON();
    },
  };
}

export type ClassDatesTable = Awaited<ReturnType<typeof createTable>>;
