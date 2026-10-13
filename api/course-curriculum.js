import { getCourseCurriculum } from "../lib/server/courseCurriculumStore.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const curriculum = await getCourseCurriculum();
    return res.status(200).json(curriculum);
  } catch (error) {
    console.error("Unable to load course curriculum from Upstash", error);
    return res.status(503).json({
      message: "Course content is temporarily unavailable. Please try again shortly.",
    });
  }
}
