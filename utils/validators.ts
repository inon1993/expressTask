import { Model as AppModel } from "../models";

export const uuidValidator =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;

export const emailValidator = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i;

export const nameValidator = /^[a-zA-Z ]+$/i;

export const phoneNoValidator =
  /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gim;

export const dateValidator =
  /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/i;

export const lecturerValidator = (
  input: Omit<AppModel["Lecturer"], "id">
): Omit<AppModel["Lecturer"], "id"> => {
  if (
    !nameValidator.test(input.name) ||
    !phoneNoValidator.test(input.phoneNumber) ||
    !emailValidator.test(input.email)
  ) {
    throw new Error("Invalid input.");
  }
  return {
    name: input.name,
    phoneNumber: input.phoneNumber,
    email: input.email,
  };
};

export const dateObjectValidator = (date: string) => {
  if (!dateValidator.test(date)) {
    throw new Error("Invalid input.");
  }

  const splitDateValidator = /[-.]/;
  const dateAsArray = date.split(splitDateValidator);
  const dateObject = new Date(
    `${dateAsArray[2]}-${dateAsArray[1]}-${dateAsArray[0]}`
  );
  return dateObject;
};
