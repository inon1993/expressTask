import express, { Response, Request } from "express";
import { DB } from "../database";
import { Model as AppModels } from "../models";
import {
  dateObjectValidator,
  lecturerStudentValidator as StudentValidator,
  uuidValidator,
} from "../utils/validators";
import * as errorMsg from "../utils/errorMessages";

export function createRouter(db: DB) {
  const studentRouter = express.Router();

  studentRouter.post("/add", async (req: Request, res: Response) => {
    const data: Omit<AppModels["Student"], "id"> = req.body;
    try {
      const validatedData = StudentValidator(data);
      const result = await db.Student.insert(validatedData);
      return res.status(200).json({ status: "created", data: result });
    } catch (error: any) {
      return res.status(400).json(error.message);
    }
  });

  studentRouter.delete(
    "/delete/:studentId",
    async (req: Request, res: Response) => {
      const id: string = req.params.studentId;
      try {
        if (!uuidValidator.test(id)) {
          throw new Error(errorMsg.invalidInput);
        }
        const isStudent = await db.Student.searchById(id);
        const result = await db.Student.delete(id);
        if (result) {
          return res.status(200).json({ status: "deleted" });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error: any) {
        return res.status(400).json(error.message);
      }
    }
  );

  studentRouter.post("/add_course", async (req: Request, res: Response) => {
    const studentId: string = req.body.studentId;
    const courseId: string = req.body.courseId;
    try {
      if (!uuidValidator.test(studentId) || !uuidValidator.test(courseId)) {
        throw new Error(errorMsg.invalidInput);
      }
      const result = await db.StudentCourses.addStudentToCourseIfAvailable(
        studentId,
        courseId
      );
      if (result) {
        return res.status(200).json({ status: "created", data: result });
      } else {
        return res.status(404).json({ status: "not found" });
      }
    } catch (error: any) {
      return res.status(400).json(error.message);
    }
  });

  studentRouter.get(
    "/:studentId/current_courses",
    async (req: Request, res: Response) => {
      const id: string = req.params.studentId;
      try {
        if (!uuidValidator.test(id)) {
          throw new Error(errorMsg.invalidInput);
        }
        const isStudent = await db.Student.searchById(id);
        const result = await db.StudentCourses.searchStudentCurrentCourses(id);
        if (result) {
          return res.status(200).json({ status: "success", data: result });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error: any) {
        return res.status(400).json(error.message);
      }
    }
  );

  studentRouter.get(
    "/:studentId/courses",
    async (req: Request, res: Response) => {
      const id: string = req.params.studentId;
      try {
        if (!uuidValidator.test(id)) {
          throw new Error(errorMsg.invalidInput);
        }
        const isStudent = await db.Student.searchById(id);
        const result = await db.StudentCourses.getStudentsCoursesHistory(id);
        if (result) {
          return res.status(200).json({ status: "success", data: result });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error: any) {
        return res.status(400).json(error.message);
      }
    }
  );

  studentRouter.get(
    "/:studentId/schedule/:startDate/:endDate",
    async (req: Request, res: Response) => {
      const id: string = req.params.studentId;
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      try {
        const startDateObject = dateObjectValidator(startDate);
        const endDateObject = dateObjectValidator(endDate);
        if (!uuidValidator.test(id) || !startDateObject || !endDateObject) {
          throw new Error(errorMsg.invalidInput);
        }
        const isStudent = await db.Student.searchById(id);
        const result = await db.StudentCourses.getStudentSchedule(
          id,
          startDateObject,
          endDateObject
        );
        if (result) {
          return res.status(200).json({ status: "success", data: result });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error: any) {
        return res.status(400).json(error.message);
      }
    }
  );

  return studentRouter;
}
