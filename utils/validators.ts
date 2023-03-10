import { Model as AppModel } from "../models";
import * as errorMsg from "./errorMessages";

export const uuidValidator =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;

export const emailValidator = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i;

export const nameValidator = /^[a-zA-Z ]+$/i;

export const courseNameValidator = /^\S+$/i;

export const phoneNoValidator =
  /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gim;

export const dateValidator =
  /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/i;

export const timeValidator = /^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/i;

export const booleanValidator = (input: string) => {
  if (input === "true") {
    return true;
  } else if (input === "false") {
    return false;
  } else {
    return null;
  }
};

export const lecturerStudentValidator = (
  input: Omit<AppModel["Lecturer"], "id">
): Omit<AppModel["Lecturer"], "id"> => {
  if (
    !nameValidator.test(input.name) ||
    !phoneNoValidator.test(input.phoneNumber) ||
    !emailValidator.test(input.email)
  ) {
    throw new Error(errorMsg.invalidInput);
  }
  return {
    name: input.name,
    phoneNumber: input.phoneNumber,
    email: input.email,
  };
};

export const dateObjectValidator = (date: string) => {
  if (!dateValidator.test(date)) {
    throw new Error(errorMsg.invalidInput);
  }

  const splitDateValidator = /[-./]/;
  const dateAsArray = date.split(splitDateValidator);
  const dateObject = new Date(
    `${dateAsArray[2]}-${dateAsArray[1]}-${dateAsArray[0]}`
  );
  return dateObject;
};

export const minimumPassScoreValidator = (score: number): boolean => {
  if (score < 0 || score > 100) {
    return false;
  }
  return true;
};

export const maximumStudentsValidator = (numOfStudents: number): boolean => {
  if (numOfStudents < 1) {
    return false;
  }
  return true;
};

export const courseFieldsFilterValidator = (input: any) => {
  const keys = Object.keys(input);
  let courseFieldsToUpdate = {};
  keys.forEach((f) => {
    if (
      [
        "courseName",
        "startingDate",
        "endDate",
        "minimumPassScore",
        "maximumStudents",
      ].includes(f)
    ) {
      courseFieldsToUpdate = {
        ...courseFieldsToUpdate,
        [f]: input[f],
      };
    }
  });

  return courseFieldsToUpdate;
};

export const courseUpdateValidator = (
  input: any,
  numOfStudents: number,
  classDatesBefore: number,
  classDatesAfter: number
) => {
  if (
    (input.courseName && !courseNameValidator.test(input.courseName)) ||
    (input.minimumPassScore &&
      !minimumPassScoreValidator(input.minimumPassScore)) ||
    (input.maximumStudents && !maximumStudentsValidator(input.maximumStudents))
  ) {
    return { status: false, msg: errorMsg.invalidInput };
  }
  if (
    input.startingDate &&
    input.endDate &&
    input.startingDate > input.endDate
  ) {
    return { status: false, msg: errorMsg.startingDateAfterEndDate };
  }

  if (input.maximumStudents && input.maximumStudents < numOfStudents) {
    return {
      status: false,
      msg: errorMsg.maxStudentSmallerThenCourseStudents,
    };
  }

  if (input.startingDate && classDatesBefore > 0) {
    return {
      status: false,
      msg: errorMsg.classDatesExistsBeforeStartingDate,
    };
  }

  if (input.endDate && classDatesAfter > 0) {
    return {
      status: false,
      msg: errorMsg.classDatesExistsAfterStartingDate,
    };
  }

  return { status: true };
};

export const courseValidator = (input: any) => {
  const startingDate = dateObjectValidator(input.startingDate);
  const endDate = dateObjectValidator(input.endDate);
  if (
    !courseNameValidator.test(input.courseName) ||
    !startingDate ||
    !endDate ||
    endDate < startingDate ||
    !minimumPassScoreValidator(input.minimumPassScore) ||
    !maximumStudentsValidator(input.maximumStudents)
  ) {
    throw new Error(errorMsg.invalidInput);
  }
  return {
    courseName: input.courseName,
    startingDate: startingDate,
    endDate: endDate,
    minimumPassScore: input.minimumPassScore,
    maximumStudents: input.maximumStudents,
  };
};

export const timeComparissionValidator = (before: string, after: string) => {
  if (!timeValidator.test(before) || !timeValidator.test(after)) {
    return false;
  }
  const beforeArr = before.split(":");
  const afterArr = after.split(":");

  beforeArr.map((b) => Number(b));
  afterArr.map((a) => Number(a));

  if (beforeArr[0] > afterArr[0]) return false;
  if (beforeArr[0] === afterArr[0]) {
    if (beforeArr[1] >= afterArr[1]) return false;
  }
  return true;
};

export const classDateValidator = (
  input: Omit<AppModel["ClassDates"], "id">
): Omit<AppModel["ClassDates"], "id"> => {
  const dateObj = dateObjectValidator(input.date.toString());

  if (
    !input.date ||
    !timeComparissionValidator(input.startHour, input.endHour) ||
    !uuidValidator.test(input.roomId) ||
    !uuidValidator.test(input.lecturerId) ||
    !uuidValidator.test(input.courseId) ||
    !uuidValidator.test(input.syllabusId)
  ) {
    throw new Error(errorMsg.invalidInput);
  }

  return {
    date: dateObj,
    startHour: input.startHour,
    endHour: input.endHour,
    roomId: input.roomId,
    lecturerId: input.lecturerId,
    courseId: input.courseId,
    syllabusId: input.syllabusId,
  };
};
