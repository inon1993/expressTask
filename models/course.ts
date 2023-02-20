import { Model as AppModel } from "./";
export interface Course {
  id: string;
  courseName: string;
  startingDate: Date;
  endDate: Date;
  minimumPassScore: number;
  maximumStudents: number;
  classDates?: Array<AppModel["ClassDates"]>;
  syllabus?: Array<AppModel["Syllabus"]>;
  isReady: boolean;
}
