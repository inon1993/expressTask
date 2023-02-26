import express from "express";
import { main as initDB } from "./database";
import { createRouter as lecturerRouter } from "./routes/lecturerRoutes";
import { createRouter as studentRouter } from "./routes/studentRoutes";
import { createRouter as courseRouter } from "./routes/courseRoutes";

const main = async () => {
  const app = express();
  const db = await initDB();
  app.use(express.json({ limit: "10kb" }));

  app.use("/lecturer", lecturerRouter(db));
  app.use("/student", studentRouter(db));
  app.use("/course", courseRouter(db));

  app.listen(8088, () => {
    console.log(`Server is listening on port 8088`);
  });
};

main().then(() => {
  console.log("Exiting");
});
