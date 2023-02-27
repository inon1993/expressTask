export const invalidInput = "Invalid input.";

export const startingDateAfterEndDate = "Starting date is after end date.";

export const maxStudentSmallerThenCourseStudents =
  "Maximum students input is less than number of students assigned to this course.";

export const classDatesExistsBeforeStartingDate =
  "There are classes set to this course before given starting date to update.";

export const classDatesExistsAfterStartingDate =
  "There are classes set to this course after given end date to update.";

export const notFound = (entry: string, id: string): string => {
  return `${entry} ID: ${id} not found.`;
};
