import express, { Response, Request } from "express";
import { DB } from "../database";
import { Model as AppModels } from "../models";
import {
  booleanValidator,
  classDateValidator,
  courseFieldsFilterValidator,
  courseUpdateValidator,
  dateObjectValidator,
  lecturerStudentValidator as StudentValidator,
  uuidValidator,
} from "../utils/validators";

export function createRouter(db: DB) {
  const courseRouter = express.Router();

  courseRouter.post("/add", async (req: Request, res: Response) => {
    const data: Omit<AppModels["Student"], "id"> = req.body;
    try {
      const validatedData = StudentValidator(data);
      const result = await db.Student.insert(validatedData);
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
    "/delete_syllabus/:syllabusId",
    async (req: Request, res: Response) => {
      const data: string = req.params.syllabusId;
      try {
        if (!uuidValidator.test(data)) {
          throw new Error("Invalid Input.");
        }
        const result = await db.Syllabus.delete(data);
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
      console.log(error);
      return res.status(400).json(error);
    }
  });

  //   studentRouter.post("/add_course", async (req: Request, res: Response) => {
  //     const studentId: string = req.body.studentId;
  //     const courseId: string = req.body.courseId;
  //     try {
  //       if (!uuidValidator.test(studentId) || !uuidValidator.test(courseId)) {
  //         throw new Error("Invalid input.");
  //       }
  //       const result = await db.StudentCourses.addStudentToCourseIfAvailable(
  //         studentId,
  //         courseId
  //       );
  //       if (result) {
  //         return res.status(200).json({ status: "created", data: result });
  //       } else {
  //         return res.status(404).json({ status: "not found" });
  //       }
  //     } catch (error) {
  //       return res.status(400).json(error);
  //     }
  //   });

  //   studentRouter.get(
  //     "/:studentId/current_courses",
  //     async (req: Request, res: Response) => {
  //       const data: string = req.params.studentId;
  //       try {
  //         if (!uuidValidator.test(data)) {
  //           throw new Error("Invalid Input.");
  //         }
  //         const result = await db.StudentCourses.searchStudentCurrentCourses(
  //           data
  //         );
  //         if (result) {
  //           return res.status(200).json({ status: "success", data: result });
  //         } else {
  //           return res.status(404).json({ status: "not found" });
  //         }
  //       } catch (error) {
  //         return res.status(400).json(error);
  //       }
  //     }
  //   );

  //   studentRouter.get(
  //     "/:studentId/courses",
  //     async (req: Request, res: Response) => {
  //       const id: string = req.params.studentId;
  //       try {
  //         if (!uuidValidator.test(id)) {
  //           throw new Error("Invalid Input.");
  //         }
  //         const result = await db.StudentCourses.getStudentsCoursesHistory(id);
  //         if (result) {
  //           return res.status(200).json({ status: "success", data: result });
  //         } else {
  //           return res.status(404).json({ status: "not found" });
  //         }
  //       } catch (error) {
  //         return res.status(400).json(error);
  //       }
  //     }
  //   );

  //   studentRouter.get(
  //     "/:studentId/schedule/:startDate/:endDate",
  //     async (req: Request, res: Response) => {
  //       const id: string = req.params.studentId;
  //       const startDate = req.params.startDate;
  //       const endDate = req.params.endDate;
  //       try {
  //         const startDateObject = dateObjectValidator(startDate);
  //         const endDateObject = dateObjectValidator(endDate);
  //         if (!uuidValidator.test(id) || !startDateObject || !endDateObject) {
  //           throw new Error("Invalid Input.");
  //         }

  //         const result = await db.StudentCourses.getStudentSchedule(
  //           id,
  //           startDateObject,
  //           endDateObject
  //         );
  //         if (result) {
  //           return res.status(200).json({ status: "success", data: result });
  //         } else {
  //           return res.status(404).json({ status: "not found" });
  //         }
  //       } catch (error) {
  //         return res.status(400).json(error);
  //       }
  //     }
  //   );

  return courseRouter;
}
