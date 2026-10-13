import { readFileSync } from "node:fs";
import { redisCommand } from "./upstashRedis.js";

const COURSE_CURRICULUM_KEY = "lms:course:curriculum";
const defaultCourseCurriculum = JSON.parse(
  readFileSync(new URL("./courseCurriculum.json", import.meta.url), "utf8"),
);

function isCourseCurriculum(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Array.isArray(value.sections) &&
    value.sections.length > 0 &&
    value.sections.every(
      (section) =>
        section &&
        typeof section.title === "string" &&
        section.title.trim().length > 0 &&
        Array.isArray(section.lessons) &&
        section.lessons.length > 0 &&
        section.lessons.every(
          (lesson) =>
            lesson &&
            typeof lesson.name === "string" &&
            lesson.name.trim().length > 0 &&
            typeof lesson.time === "string" &&
            typeof lesson.locked === "boolean" &&
            typeof lesson.videoUrl === "string" &&
            lesson.resources &&
            typeof lesson.resources.powerpointUrl === "string" &&
            Array.isArray(lesson.resources.youtubeLinks) &&
            lesson.resources.youtubeLinks.every(
              (link) => typeof link === "string",
            ),
        ),
    )
  );
}

function parseCourseCurriculum(value) {
  let curriculum;
  try {
    curriculum = JSON.parse(value);
  } catch (error) {
    throw new Error("Stored course curriculum is not valid JSON", { cause: error });
  }

  if (!isCourseCurriculum(curriculum)) {
    throw new Error("Stored course curriculum has an invalid structure");
  }

  return curriculum;
}

export async function getCourseCurriculum() {
  const storedCurriculum = await redisCommand("GET", COURSE_CURRICULUM_KEY);
  if (storedCurriculum !== null && storedCurriculum !== undefined) {
    if (typeof storedCurriculum !== "string") {
      throw new Error("Stored course curriculum has an invalid value");
    }
    return parseCourseCurriculum(storedCurriculum);
  }

  if (!isCourseCurriculum(defaultCourseCurriculum)) {
    throw new Error("Default course curriculum has an invalid structure");
  }

  const seeded = await redisCommand(
    "SET",
    COURSE_CURRICULUM_KEY,
    JSON.stringify(defaultCourseCurriculum),
    "NX",
  );
  if (seeded === "OK") return defaultCourseCurriculum;

  const concurrentlySeededCurriculum = await redisCommand(
    "GET",
    COURSE_CURRICULUM_KEY,
  );
  if (typeof concurrentlySeededCurriculum !== "string") {
    throw new Error("Course curriculum could not be initialized in Upstash");
  }
  return parseCourseCurriculum(concurrentlySeededCurriculum);
}
