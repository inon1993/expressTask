import { main as initDB } from "./database";

const main = async () => {
  const db = await initDB();
  const course = {
    courseName: "JavaScript",
    startingDate: new Date(2023, 3, 1),
    endDate: new Date(2023, 6, 1),
    minimumPassScore: 75,
    maximumStudents: 50,
  };

  await db.Course.insert(course);
};

main().then(() => {
  console.log("Exiting");
});
