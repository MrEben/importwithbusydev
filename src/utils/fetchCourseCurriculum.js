import { readApiResponse } from "./readApiResponse.js";

export async function fetchCourseCurriculum({ signal } = {}) {
  const response = await fetch("/api/course-curriculum", {
    signal,
    cache: "no-store",
  });
  const curriculum = await readApiResponse(response, "Course curriculum");

  if (!response.ok) {
    throw new Error(curriculum.message || "Could not load course content.");
  }
  if (!Array.isArray(curriculum.sections) || curriculum.sections.length === 0) {
    throw new Error("Course curriculum returned an invalid response.");
  }

  return curriculum;
}
