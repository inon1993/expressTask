import express, { Response, Request } from "express";
import { DB } from "../database";
import { Model as AppModels } from "../models";
import {
  booleanValidator,
  classDateValidator,
  courseFieldsFilterValidator,
  courseUpdateValidator,
  courseValidator,
  dateObjectValidator,
  uuidValidator,
} from "../utils/validators";

export function createRouter(db: DB) {
  const courseRouter = express.Router();

  courseRouter.post("/add", async (req: Request, res: Response) => {
    const data: Omit<AppModels["Course"], "id"> = req.body;
    try {
      const validatedData = courseValidator(data);
      const result = await db.Course.insert(validatedData);
      return res.status(200).json({ status: "created", data: result });
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  courseRouter.post("/add_syllabus", async (req: Request, res: Response) => {
    const data: Omit<AppModels["Syllabus"], "id"> = req.body;
    try {
      if (!uuidValidator.test(data.courseId) || !data.title) {
        throw new Error("Invalid input");
      }
      const result = await db.Syllabus.insert(data);
      return res.status(200).json({ status: "created", data: result });
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  courseRouter.delete(
    "/delete/:courseId",
    async (req: Request, res: Response) => {
      const data: string = req.params.courseId;
      try {
        if (!uuidValidator.test(data)) {
          throw new Error("Invalid Input.");
        }
        const result = await db.Course.delete(data);
        if (result) {
          return res.status(200).json({ status: "deleted" });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error) {
        return res.status(400).json(error);
      }
    }
  );

  courseRouter.post("/add_class_date", async (req: Request, res: Response) => {
    const data: Omit<AppModels["ClassDates"], "id"> = req.body;
    try {
      const validatedData = classDateValidator(data);
      if (!validatedData) {
        throw new Error("Invalid input");
      }
      const result = await db.ClassDates.insert(validatedData);
      return res.status(200).json({ status: "created", data: result });
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  courseRouter.delete(
    "/delete_class_date/:classDateId",
    async (req: Request, res: Response) => {
      const data: string = req.params.classDateId;
      try {
        if (!uuidValidator.test(data)) {
          throw new Error("Invalid Input.");
        }
        const result = await db.ClassDates.delete(data);
        if (result) {
          return res.status(200).json({ status: "deleted" });
        } else {
          return res.status(404).json({ status: "not found" });
        }
      } catch (error) {
        return res.status(400).json(error);
      }
    }
  );

  courseRouter.get(
    "/:courseId/:fullInfo",
    async (req: Request, res: Response) => {
      try {
        const courseId = req.params.courseId;
        const fullInfo = booleanValidator(req.params.fullInfo);
        if (!uuidValidator.test(courseId) || fullInfo === null) {
          throw new Error("Invalid input.");
        }
        const result = await db.ClassDates.getCourse(courseId, fullInfo);
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

  courseRouter.put("/update/:courseId", async (req: Request, res: Response) => {
    try {
      const id = req.params.courseId;
      if (!uuidValidator.test(id)) {
        throw new Error("Invalid course ID");
      }
      const data = req.body;
      const numOfStudents = await db.StudentCourses.countStudents(id);
      if (data.startingDate) {
        data.startingDate = dateObjectValidator(data.startingDate);
      }
      if (data.endDate) {
        data.endDate = dateObjectValidator(data.endDate);
      }
      const classDatesBefore = await db.ClassDates.getClassDatesBeforeDate(
        id,
        data.startingDate
      );
      const classDatesAfter = await db.ClassDates.getClassDatesAfterDate(
        id,
        data.endDate
      );
      const fieldsToUpdate: any = courseFieldsFilterValidator(data);
      const isValid = courseUpdateValidator(
        fieldsToUpdate,
        numOfStudents,
        classDatesBefore.length,
        classDatesAfter.length
      );
      if (!isValid.status) {
        throw new Error(isValid.msg);
      }
      const result = await db.Course.update(id, fieldsToUpdate);
      if (result) {
        return res.status(200).json({ status: "success", data: result });
      } else {
        return res.status(404).json({ status: "not found" });
      }
    } catch (error) {
      return res.status(400).json(error);
    }
  });

  courseRouter.put(
    "/set_is_ready/:courseId",
    async (req: Request, res: Response) => {
      try {
        const results = { status: "", comments: "" };
        const id = req.params.courseId;
        if (!uuidValidator.test(id)) {
          throw new Error("Invalid input.");
        }
        const isSyllabus = await db.Syllabus.countSyllabus(id);
        if (!isSyllabus || isSyllabus < 1) {
          const updateRow = await db.Course.updateReady(id, false);
          results.comments += "Missing syllabus. ";
          results.status = "not ready";
        }
        const isClassDates = await db.ClassDates.countClassDates(id);
        if (!isClassDates || isClassDates < 1) {
          const updateRow = await db.Course.updateReady(id, false);
          results.comments += "Missing class dates. ";
          results.status = "not ready";
        }
        if (isSyllabus > 0 && isClassDates > 0) {
          const updateRow = await db.Course.updateReady(id, true);
          results.status = "ready";
        }
        return res.status(200).json(results);
      } catch (error) {
        return res.status(400).json(error);
      }
    }
  );
  return courseRouter;
}
