export interface Course {
  id: string;
  courseName: string;
  startingDate: Date;
  endDate: Date;
  minimumPassScore: number;
  maximumStudents: number;
  isReady: boolean;
}
