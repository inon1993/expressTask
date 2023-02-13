import { Sequelize } from "sequelize";
import { getConnection } from "./connection";
import { createTable as createCourse } from "./courseTable";
import { createTable as createClassDates } from "./classDatesTable";
import { createTable as createSyllabus } from "./syllabusTable";
import { createTable as createLecturer } from "./lecturerTable";
import { createTable as createStudent } from "./studentTable";

export async function createDatabase() {
  const sequelize = new Sequelize({
    dialect: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "1050650",
    logging: (sql) => {
      console.log("Query: %s", sql);
    },
  });
  const result =
    await sequelize.query(`CREATE DATABASE express_task WITH                    \
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;`);
  await sequelize.query("GRANT ALL ON DATABASE express_task TO postgres;");
  console.log(result);
}

export async function createSchema(sequelize: Sequelize) {
  const result = await sequelize.query("CREATE SCHEMA express_task");
  console.log(result);
}

export async function createTables(createDB: boolean) {
  if (createDB) await createDatabase();

  const connection = getConnection();
  if (createDB) await createSchema(connection);

  const Course = await createCourse(connection);
  const Lecturer = await createLecturer(connection);
  const ClassDates = await createClassDates(
    connection,
    Course.Schema,
    Lecturer.Schema
  );
  const Syllabus = await createSyllabus(connection, ClassDates.Schema);
  const Student = await createStudent(connection);

  return {
    Syllabus,
    Course,
    Student,
    Lecturer,
    ClassDates,
  };
}
