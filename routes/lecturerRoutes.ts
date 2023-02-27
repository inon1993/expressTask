import express, { Response, Request } from "express";
import { DB } from "../database";
import { Model as AppModels } from "../models";
import {
  dateObjectValidator,
  lecturerStudentValidator as lecturerValidator,
  uuidValidator,
} from "../utils/validators";

export function createRouter(db: DB) {
  const lecturerRouter = express.Router();

  lecturerRouter.post("/add", async (req: Request, res: Response) => {
    const data: Omit<AppModels["Lecturer"], "id"> = req.body;
    try {
      const validatedData = lecturerValidator(data);
      const result = await db.Lecturer.insert(validatedData);
      return res.status(200).json({ status: "created", data: result });
    } catch (error: any) {
      return res.status(400).json(error.message);
    }
  });

  lecturerRouter.delete(
    "/delete/:lecturerId",
    async (req: Request, res: Response) => {
      const id: string = req.params.lecturerId;
      try {
        if (!uuidValidator.test(id)) {
          throw new Error("Invalid Input.");
        }
        const lecturer = await db.Lecturer.searchById(id);
        const result = await db.Lecturer.delete(id);
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

  lecturerRouter.get(
    "/:lecturerId/current_courses",
    async (req: Request, res: Response) => {
      const id: string = req.params.lecturerId;
      try {
        if (!uuidValidator.test(id)) {
          throw new Error("Invalid Input.");
        }
        const lecturer = await db.Lecturer.searchById(id);
        const result = await db.ClassDates.searchLecturerCurrentCourses(id);
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

  lecturerRouter.get(
    "/:lecturerId/courses/:startDate/:endDate",
    async (req: Request, res: Response) => {
      const id: string = req.params.lecturerId;
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      try {
        const startDateObject = dateObjectValidator(startDate);
        const endDateObject = dateObjectValidator(endDate);
        if (!uuidValidator.test(id) || !startDateObject || !endDateObject) {
          throw new Error("Invalid Input.");
        }
        const lecturer = await db.Lecturer.searchById(id);
        const result = await db.ClassDates.searchLecturerCourses(
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

  lecturerRouter.get(
    "/:lecturerId/schedule/:startDate/:endDate",
    async (req: Request, res: Response) => {
      const id: string = req.params.lecturerId;
      const startDate = req.params.startDate;
      const endDate = req.params.endDate;
      try {
        const startDateObject = dateObjectValidator(startDate);
        const endDateObject = dateObjectValidator(endDate);
        if (!uuidValidator.test(id) || !startDateObject || !endDateObject) {
          throw new Error("Invalid Input.");
        }
        const lecturer = await db.Lecturer.searchById(id);
        const result = await db.ClassDates.getLecturerSchedule(
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

  return lecturerRouter;
}
