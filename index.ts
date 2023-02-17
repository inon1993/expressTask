import { main as initDB } from "./database";

const main = async () => {
  try {
    const db = await initDB();
    const course1 = {
      courseName: "JavaScript",
      startingDate: new Date(2023, 3, 1),
      endDate: new Date(2023, 6, 1),
      minimumPassScore: 75,
      maximumStudents: 50,
    };
    // await db.Course.insert(course1);

    const course2 = {
      courseName: "Node.js",
      startingDate: new Date(2023, 7, 1),
      endDate: new Date(2023, 10, 1),
      minimumPassScore: 75,
      maximumStudents: 50,
    };
    // await db.Course.insert(course2);

    const course3 = {
      courseName: "Private class",
      startingDate: new Date(2023, 7, 1),
      endDate: new Date(2023, 10, 1),
      minimumPassScore: 75,
      maximumStudents: 1,
    };
    // await db.Course.insert(course3);

    const lecturer1 = {
      name: "Yaki",
      phoneNumber: "0541111111",
      email: "yaki@gmail.com",
    };
    const lecturer2 = {
      name: "Chaim",
      phoneNumber: "0542222222",
      email: "chaim@gmail.com",
    };
    // await db.Lecturer.insert(lecturer1);
    // await db.Lecturer.insert(lecturer2);

    const student1 = {
      name: "Inon",
      phoneNumber: "054222222",
      email: "inon@",
    };

    // const studentEntry1 = await db.Student.insert(student1);

    const student2 = {
      name: "Moshe",
      phoneNumber: "054222222",
      email: "moshe@",
    };

    // const studentEntry2 = await db.Student.insert(student2);

    const r = {
      roomNumber: 1,
    };

    // const re = db.Room.insert(r);

    const r2 = {
      roomNumber: 2,
    };

    // const re2 = db.Room.insert(r2);

    const s1 = {
      courseId: "5afe1796-d465-44ab-b4bb-3baae6d79886",
      title: "JavaScript syllabus",
      description: "First lesson.",
      references: ["js.com", "site.com"],
    };

    // const se1 = await db.Syllabus.insert(s1);

    const s2 = {
      courseId: "5afe1796-d465-44ab-b4bb-3baae6d79886",
      title: "JavaScript syllabus",
      description: "Second lesson.",
      references: ["js.com", "site.com", "one.com"],
    };

    // const se2 = await db.Syllabus.insert(s2);

    const s3 = {
      courseId: "01a8eaca-fdcb-440c-a912-3196e30d31bb",
      title: "Node.js syllabus",
      description: "First lesson.",
      references: ["nodejs.com", "site2.com"],
    };

    // const se3 = await db.Syllabus.insert(s3);

    const cd1 = {
      date: new Date(2023, 5, 1),
      startHour: "18:00",
      endHour: "21:30",
      roomId: "76d1d9eb-d5f3-45be-9ed9-b1930992e161",
      courseId: "5afe1796-d465-44ab-b4bb-3baae6d79886",
      lecturerId: "789ed03e-f89c-4238-baa5-b1e4f94b995c",
      syllabusId: "08e825fd-8f74-49e4-bf6a-89c483967660",
    };

    // const cde = await db.ClassDates.insert(cd1);

    const cd2 = {
      date: new Date(2023, 5, 2),
      startHour: "23:30",
      endHour: "23:50",
      roomId: "a0c4aa9c-1734-4a21-84be-484904ee8051",
      courseId: "5afe1796-d465-44ab-b4bb-3baae6d79886",
      lecturerId: "789ed03e-f89c-4238-baa5-b1e4f94b995c",
      syllabusId: "08e825fd-8f74-49e4-bf6a-89c483967660",
    };

    // const cde2 = await db.ClassDates.insert(cd2);

    // const sc = await db.StudentCourses.addStudentToCourseIfAvailable(
    //   "4775ee93-9d95-4e88-a17a-57985d2840b4",
    //   "6489e8ce-305a-4030-b2cf-d02201a21316"
    // );

    //   const cl = await db.ClassDates.searchLecturerCourses(
    //     "32ba93be-6e7f-426c-88fd-d26234fe2e5c",
    //     new Date(2023, 3, 1),
    //     new Date(2023, 6, 1)
    //   );

    //   const ls = await db.ClassDates.getLecturerSchedule(
    //     "32ba93be-6e7f-426c-88fd-d26234fe2e5c",
    //     new Date(2023, 1, 1),
    //     new Date(2023, 2, 1)
    //   );
    //   console.log(cl);
    //   console.log(ls);

    //   await db.StudentCourses.addStudentToCourseIfAvailable(
    //     "6f2a6a7f-353d-493a-8bba-684e115ab636",
    //     "9f21df1c-41f6-4757-bb3e-9433fca15c44"
    //   );

    //   await db.Lecturer.delete("a44e7c7f-a08d-4600-8c0b-50fc0b8ff50b");
    //   const classDateEntry = {
    //     courseId: "728308c7-5775-4e79-8f57-5754a1c4bb56",
    //     date: new Date(),
    //     startHour: 18,
    //     endHour: 21,
    //     roomId: "55",
    //     lecturerId: "dda92f36-af47-451a-9477-7a2b34ae9b14",
    //   };
    //   const cd = await db.ClassDates.insert(classDateEntry);
    //   const classDate = await db.ClassDates.serchLecturersCourses(
    //     "dda92f36-af47-451a-9477-7a2b34ae9b14",
    //     "728308c7-5775-4e79-8f57-5754a1c4bb56"
    //   );

    //   classDate.forEach((cd) => console.log(cd?.toJSON()));
  } catch (error) {
    console.log(error);
  }
};

main().then(() => {
  console.log("Exiting");
});
