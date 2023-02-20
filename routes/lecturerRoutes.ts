import express, { Response, Request } from "express";
import { DB } from "../database";
import { Model as AppModels } from "../models";
import {
  dateObjectValidator,
  lecturerValidator,
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
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  lecturerRouter.delete("/delete", async (req: Request, res: Response) => {
    const data: string = req.body.id;
    try {
      if (!uuidValidator.test(data)) {
        throw new Error("Invalid Input.");
      }
      const result = await db.Lecturer.delete(data);
      if (result) {
        return res.status(200).json({ status: "deleted" });
      } else {
        return res.status(404).json({ status: "not found" });
      }
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  lecturerRouter.get(
    "/:lecturerId/current_courses",
    async (req: Request, res: Response) => {
      const data: string = req.params.lecturerId;
      try {
        if (!uuidValidator.test(data)) {
          throw new Error("Invalid Input.");
        }
        const result = await db.ClassDates.searchLecturerCurrentCourses(data);
        if (result) {
          return res.status(200).json({ status: "success", data: result });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error) {
        return res.status(400).json(error);
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
      } catch (error) {
        return res.status(400).json(error);
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
      } catch (error) {
        return res.status(400).json(error);
      }
    }
  );

  return lecturerRouter;
}
