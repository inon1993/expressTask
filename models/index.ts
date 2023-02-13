import { Course } from "./course";
import { ClassDates } from "./classDates";
import { Syllabus } from "./syllabus";
import { Lecturer } from "./lecturer";
import { Student } from "./student";

export type Model = {
  Course: Course;
  ClassDates: ClassDates;
  Syllabus: Syllabus;
  Lecturer: Lecturer;
  Student: Student;
};
