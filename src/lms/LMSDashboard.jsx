import { useEffect, useMemo, useState } from "react";
import courseCurriculum from "../data/courseCurriculum.json";
import { readApiResponse } from "../utils/readApiResponse.js";

const courseModules = courseCurriculum.sections.map((section, moduleIndex) => ({
  id: `module-${moduleIndex + 1}`,
  title: section.title,
  lessons: section.lessons.map((lesson, lessonIndex) => ({
    id: `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
    title: lesson.name,
    duration: lesson.time,
    videoUrl: lesson.videoUrl,
    resources: lesson.resources,
  })),
}));

const allLessons = courseModules.flatMap((module) =>
  module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id })),
);
const lessonIds = new Set(allLessons.map((lesson) => lesson.id));
const progressStorageKey = "busydev-lms-completed-lessons";

function getVideoSource(videoUrl) {
  if (!videoUrl?.trim()) return null;

  try {
    const url = new URL(videoUrl.trim());
    if (url.protocol !== "https:") return { type: "unsupported" };

    if (
      ["www.youtube.com", "youtube.com", "m.youtube.com"].includes(url.hostname)
    ) {
      const videoId =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
      return videoId
        ? { type: "embed", src: `https://www.youtube-nocookie.com/embed/${videoId}` }
        : { type: "unsupported" };
    }

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.slice(1).split("/")[0];
      return videoId
        ? { type: "embed", src: `https://www.youtube-nocookie.com/embed/${videoId}` }
        : { type: "unsupported" };
    }

    if (url.hostname === "fast.wistia.com") {
      const wistiaMediaId =
        url.pathname.match(/^\/embed\/([a-z0-9]+)\.js$/i)?.[1] ??
        url.pathname.match(/^\/embed\/medias\/([a-z0-9]+)$/i)?.[1];
      return wistiaMediaId
        ? {
            type: "embed",
            src: `https://fast.wistia.net/embed/iframe/${wistiaMediaId}?seo=false&videoFoam=true`,
          }
        : { type: "unsupported" };
    }

    if (
      url.hostname === "fast.wistia.net" &&
      url.pathname.startsWith("/embed/iframe/")
    ) {
      return { type: "embed", src: url.href };
    }

    if (url.hostname === "play.gumlet.io" && url.pathname.startsWith("/embed/")) {
      return { type: "embed", src: url.href };
    }

    if (url.hostname === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
      return { type: "embed", src: url.href };
    }

    if (url.hostname === "vimeo.com" && /^\d+$/.test(url.pathname.slice(1))) {
      return {
        type: "embed",
        src: `https://player.vimeo.com/video/${url.pathname.slice(1)}`,
      };
    }

    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
      return { type: "file", src: url.href };
    }
  } catch (error) {
    console.error("Unable to parse LMS lesson video URL:", error);
  }

  return { type: "unsupported" };
}

function readCompletedLessons() {
  try {
    const saved = window.localStorage.getItem(progressStorageKey);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? [...new Set(parsed)].filter((lessonId) => lessonIds.has(lessonId))
      : [];
  } catch (error) {
    console.error("Unable to load LMS lesson progress:", error);
    return [];
  }
}

function LessonIcon({ completed = false }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
        completed
          ? "bg-emerald-100 text-emerald-700"
          : "bg-[#f4efe6] text-[#857866]"
      }`}
    >
      {completed ? "✓" : "▶"}
    </span>
  );
}

function LMSDashboardContent({ email, onLogout }) {
  const [completedLessons, setCompletedLessons] = useState(readCompletedLessons);
  const [selectedLessonId, setSelectedLessonId] = useState(allLessons[0].id);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        progressStorageKey,
        JSON.stringify(completedLessons),
      );
    } catch (error) {
      console.error("Unable to save LMS lesson progress:", error);
    }
  }, [completedLessons]);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    function updateViewport() {
      setIsMobileViewport(mobileViewport.matches);
      if (!mobileViewport.matches) setIsMobileMenuOpen(false);
    }

    mobileViewport.addEventListener("change", updateViewport);
    return () => mobileViewport.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  const selectedLesson =
    allLessons.find((lesson) => lesson.id === selectedLessonId) ?? allLessons[0];
  const selectedModule = courseModules.find(
    (module) => module.id === selectedLesson.moduleId,
  );
  const videoSource = getVideoSource(selectedLesson.videoUrl);
  const progress = Math.round((completedLessons.length / allLessons.length) * 100);
  const filteredModules = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courseModules;

    return courseModules
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter((lesson) =>
          `${module.title} ${lesson.title}`.toLowerCase().includes(query),
        ),
      }))
      .filter((module) => module.lessons.length > 0);
  }, [search]);

  function toggleLessonComplete() {
    setCompletedLessons((current) =>
      current.includes(selectedLesson.id)
        ? current.filter((lessonId) => lessonId !== selectedLesson.id)
        : [...current, selectedLesson.id],
    );
  }

  function startNextLesson() {
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === selectedLesson.id,
    );
    const nextLesson = allLessons[currentIndex + 1];
    if (nextLesson) setSelectedLessonId(nextLesson.id);
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#201d18]">
      <header className="sticky top-0 z-20 border-b border-[#e9e4da] bg-[#fffefa]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open course menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="lms-course-sidebar"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e9e4da] text-[#60594f] transition hover:bg-[#f5f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 md:hidden"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <a
              href="/"
              className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#202821] text-sm font-black tracking-tight text-[#e7b75e]">
                BD
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold leading-tight tracking-tight">
                  Import with BusyDev
                </span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#887f72]">
                  Student learning portal
                </span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 sm:inline-flex">
              {email}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-[#e9e4da] px-4 py-2 text-xs font-bold text-[#60594f] transition hover:border-[#cfc5b4] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Sign out
            </button>
            <a
              href="/"
              className="hidden rounded-full border border-[#e9e4da] px-4 py-2 text-xs font-bold text-[#60594f] transition hover:border-[#cfc5b4] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 sm:inline-flex"
            >
              Back to site
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[272px_minmax(0,1fr)]">
        {isMobileMenuOpen && (
          <button
            type="button"
            aria-label="Close course menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[72px] z-30 bg-[#201d18]/40 md:hidden"
          />
        )}
        <aside
          id="lms-course-sidebar"
          role={isMobileMenuOpen ? "dialog" : undefined}
          aria-modal={isMobileMenuOpen ? "true" : undefined}
          aria-label={isMobileMenuOpen ? "Course menu" : undefined}
          aria-hidden={isMobileViewport && !isMobileMenuOpen}
          inert={isMobileViewport && !isMobileMenuOpen}
          className={`fixed bottom-0 left-0 top-[72px] z-40 w-[min(88vw,320px)] overflow-y-auto border-r border-[#e9e4da] bg-[#fffefa] px-5 py-6 shadow-[12px_0_40px_rgba(32,29,24,0.12)] transition-[transform,visibility] duration-300 md:sticky md:top-[72px] md:z-auto md:h-[calc(100vh-72px)] md:w-auto md:shadow-none md:px-6 ${
            isMobileMenuOpen
              ? "visible translate-x-0"
              : "invisible -translate-x-full"
          } md:visible md:translate-x-0`}
        >
          <div className="mb-5 flex items-center justify-between md:hidden">
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#887f72]">
              Course menu
            </span>
            <button
              type="button"
              aria-label="Close course menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9e4da] text-lg text-[#60594f] hover:bg-[#f5f1e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              ×
            </button>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.19em] text-[#a08c6a]">
              Your course
            </p>
            <h1 className="mt-2 text-lg font-extrabold leading-snug tracking-tight">
              Importation Masterclass
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-[#81796e]">
              Your start-to-finish guide to sourcing, shipping, and selling.
            </p>
          </div>

          <div className="mb-6 rounded-2xl bg-[#f5f1e9] p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold">Course progress</span>
              <span className="font-extrabold text-[#8b6426]">{progress}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[#e4ded2]"
              role="progressbar"
              aria-label="Course progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#c38d3b] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[#81796e]">
              {completedLessons.length} of {allLessons.length} lessons complete
            </p>
          </div>

          <label className="mb-4 block">
            <span className="sr-only">Search lessons</span>
            <span className="flex items-center gap-2 rounded-xl border border-[#e9e4da] bg-white px-3">
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[#928879]"
                viewBox="0 0 20 20"
                fill="none"
              >
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
                <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#a39a8d]"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Find a lesson"
              />
            </span>
          </label>

          <nav aria-label="Course lessons" className="space-y-5">
            {filteredModules.map((module) => (
              <section key={module.id} aria-labelledby={`module-${module.id}`}>
                <h2
                  id={`module-${module.id}`}
                  className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#9a907f]"
                >
                  {module.title}
                </h2>
                <ul className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const isSelected = selectedLesson.id === lesson.id;
                    const isComplete = completedLessons.includes(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button
                          type="button"
                          aria-current={isSelected ? "step" : undefined}
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-600 ${
                            isSelected
                              ? "bg-[#f4ecdc] text-[#72511f]"
                              : "text-[#686157] hover:bg-[#f7f4ee]"
                          }`}
                        >
                          <LessonIcon completed={isComplete} />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold leading-snug">
                              {lesson.title}
                            </span>
                            <span className="mt-1 block text-[10px] text-[#9a907f]">
                              {lesson.duration}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {filteredModules.length === 0 && (
              <p className="rounded-xl bg-[#f5f1e9] p-3 text-xs leading-relaxed text-[#81796e]">
                No lessons match “{search}”. Try another search.
              </p>
            )}
          </nav>
          <p className="mt-8 border-t border-[#eee9e0] pt-4 text-[11px] leading-relaxed text-[#918879]">
            Need help with your course? Contact the BusyDev support team.
          </p>
        </aside>

        <main className="min-w-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-[960px]">
            <p className="text-xs font-semibold text-[#8a8174]">
              My learning <span className="px-1.5 text-[#c5b9a7]">/</span>{" "}
              {selectedModule.title}
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a07a3e]">
                  Your learning dashboard
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-[40px]">
                  Welcome to your classroom.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#777064]">
                  Pick up where you left off and build your import business one
                  practical step at a time.
                </p>
              </div>
              <span className="rounded-full bg-[#eee8dc] px-3 py-1.5 text-[11px] font-bold text-[#75664f]">
                {allLessons.length} lessons · Self-paced
              </span>
            </div>

            <section
              aria-labelledby="continue-title"
              className="relative mt-8 overflow-hidden rounded-[26px] bg-[#202821] p-6 text-[#fffaf1] shadow-[0_20px_50px_rgba(40,43,34,0.12)] sm:p-9"
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[1px] border-[#dfbb77]/20"
              />
              <div
                aria-hidden="true"
                className="absolute -right-5 -top-12 h-52 w-52 rounded-full border-[1px] border-[#dfbb77]/20"
              />
              <div className="relative max-w-xl">
                {/* <span className="inline-flex rounded-full border border-[#dfbb77]/30 bg-[#dfbb77]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e7c98f]">
                  {completedLessons.length === 0 ? "Start learning" : "Continue learning"}
                </span> */}
                <h3
                  id="continue-title"
                  className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl"
                >
                  {selectedLesson.title}
                </h3>
                <p className="mt-2 text-sm text-[#d0cfc5]">
                  {selectedModule.title} <span className="px-1.5">·</span>{" "}
                  {selectedLesson.duration}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("lesson-workspace")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#e5b75f] px-5 py-3 text-sm font-extrabold text-[#29251d] transition hover:bg-[#f0c979] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0c979]"
                >
                  {completedLessons.includes(selectedLesson.id)
                    ? "Review lesson"
                    : "Open lesson"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </section>

            <section
              id="lesson-workspace"
              aria-labelledby="lesson-title"
              className="mt-8 scroll-mt-24 rounded-[24px] border border-[#eae5dc] bg-white p-6 shadow-[0_10px_35px_rgba(71,53,34,0.04)] sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a07a3e]">
                    Lesson workspace
                  </p>
                  <h3
                    id="lesson-title"
                    className="mt-2 text-2xl font-extrabold tracking-tight"
                  >
                    {selectedLesson.title}
                  </h3>
                </div>
                <span className="rounded-full bg-[#f5f1e9] px-3 py-1.5 text-xs font-bold text-[#716858]">
                  {selectedLesson.duration}
                </span>
              </div>

              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-[#202821] text-center text-[#fffaf1]">
                {videoSource?.type === "embed" && (
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={videoSource.src}
                    title={selectedLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
                {videoSource?.type === "file" && (
                  <video
                    className="absolute inset-0 h-full w-full"
                    src={videoSource.src}
                    title={selectedLesson.title}
                    controls
                    playsInline
                  >
                    Your browser does not support embedded video.
                  </video>
                )}
                {!videoSource && (
                  <div
                    role="img"
                    aria-label={`Video placeholder for ${selectedLesson.title}`}
                    className="absolute inset-0 flex flex-col items-center justify-center px-6"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e5b75f]/50 bg-[#e5b75f]/10 text-[#e5b75f]"
                    >
                      <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11 6.7a1.6 1.6 0 0 1 0 2.8l-11 6.7c-.7.4-1.6-.1-1.6-.9V4.8Z" />
                      </svg>
                    </span>
                    <p className="mt-5 text-sm font-extrabold sm:text-base">
                      Lesson video
                    </p>
                    <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#d0cfc5]">
                      Video content for this lesson will appear here.
                    </p>
                  </div>
                )}
                {videoSource?.type === "unsupported" && (
                  <div
                    role="alert"
                    className="absolute inset-0 flex flex-col items-center justify-center px-6"
                  >
                    <p className="text-sm font-bold">Unsupported video link</p>
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-[#d0cfc5]">
                      Use a YouTube, Gumlet, or Vimeo link, or a direct MP4, WebM, or Ogg video URL.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-[#eee9e0] pt-5">
                <section
                  aria-labelledby="lesson-resources-title"
                  className="rounded-2xl border border-[#eae5dc] bg-[#fcfaf6] p-5 sm:p-6"
                >
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#a07a3e]">
                      Lesson materials
                    </p>
                    <h4
                      id="lesson-resources-title"
                      className="mt-1 text-lg font-extrabold tracking-tight"
                    >
                      Resources for this lesson
                    </h4>
                  </div>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <h5 className="text-xs font-extrabold text-[#39342c]">
                        PowerPoint slides
                      </h5>
                      {selectedLesson.resources?.powerpointUrl ? (
                        <a
                          href={selectedLesson.resources.powerpointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#8b6426] underline decoration-[#c9ad7b] underline-offset-4 hover:text-[#684914] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                        >
                          Download PowerPoint slides
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <p className="mt-2 text-xs leading-relaxed text-[#81796e]">
                          No PowerPoint slides have been added yet.
                        </p>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-[#39342c]">
                        Related YouTube videos
                      </h5>
                      {selectedLesson.resources?.youtubeLinks?.length ? (
                        <ul className="mt-2 space-y-2">
                          {selectedLesson.resources.youtubeLinks.map(
                            (youtubeLink, index) => (
                              <li key={`${youtubeLink.url}-${index}`}>
                                <a
                                  href={youtubeLink.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-start gap-2 text-xs font-semibold leading-relaxed text-[#8b6426] underline decoration-[#c9ad7b] underline-offset-4 hover:text-[#684914] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                                >
                                  <span aria-hidden="true">▶</span>
                                  {youtubeLink.title || `YouTube resource ${index + 1}`}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs leading-relaxed text-[#81796e]">
                          No related YouTube videos have been added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={toggleLessonComplete}
                    className={`rounded-full border px-4 py-2.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                      completedLessons.includes(selectedLesson.id)
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "border-[#ded5c6] bg-white text-[#61594e] hover:bg-[#faf7f1]"
                    }`}
                  >
                    {completedLessons.includes(selectedLesson.id)
                      ? "✓ Completed · Mark incomplete"
                      : "Mark lesson complete"}
                  </button>
                  <button
                    type="button"
                    onClick={startNextLesson}
                    disabled={
                      selectedLesson.id === allLessons[allLessons.length - 1].id
                    }
                    className="rounded-full bg-[#202821] px-5 py-2.5 text-xs font-bold text-[#fffaf1] transition hover:bg-[#354136] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next lesson <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="modules-title">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a07a3e]">
                    The roadmap
                  </p>
                  <h3
                    id="modules-title"
                    className="mt-1 text-xl font-extrabold tracking-tight"
                  >
                    Your course modules
                  </h3>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {courseModules.map((module, index) => {
                  const completedCount = module.lessons.filter((lesson) =>
                    completedLessons.includes(lesson.id),
                  ).length;
                  const moduleProgress = Math.round(
                    (completedCount / module.lessons.length) * 100,
                  );
                  const isExpanded = expandedModuleId === module.id;
                  const moduleLessonsId = `roadmap-lessons-${module.id}`;
                  return (
                    <article
                      key={module.id}
                      className="overflow-hidden rounded-2xl border border-[#eae5dc] bg-white transition hover:border-[#d8c9ad] hover:shadow-[0_12px_30px_rgba(71,53,34,0.07)]"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={moduleLessonsId}
                        onClick={() =>
                          setExpandedModuleId(isExpanded ? null : module.id)
                        }
                        className="w-full p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-600"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f1e9] text-xs font-extrabold text-[#96703a]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-bold text-[#898173]">
                            {completedCount}/{module.lessons.length} lessons
                          </span>
                        </div>
                        <span className="mt-4 flex items-center justify-between gap-3 text-sm font-extrabold">
                          {module.title}
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-base text-[#96703a]"
                          >
                            {isExpanded ? "−" : "+"}
                          </span>
                        </span>
                        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-[#eee9e0]">
                          <span
                            className="block h-full rounded-full bg-[#c38d3b]"
                            style={{ width: `${moduleProgress}%` }}
                          />
                        </span>
                      </button>
                      {isExpanded && (
                        <ul
                          id={moduleLessonsId}
                          className="space-y-1 border-t border-[#eee9e0] px-3 py-3"
                        >
                          {module.lessons.map((lesson) => {
                            const isComplete = completedLessons.includes(lesson.id);
                            const isSelected = selectedLesson.id === lesson.id;
                            return (
                              <li key={lesson.id}>
                                <button
                                  type="button"
                                  aria-current={isSelected ? "step" : undefined}
                                  onClick={() => {
                                    setSelectedLessonId(lesson.id);
                                    document
                                      .getElementById("lesson-workspace")
                                      ?.scrollIntoView({
                                        behavior: "smooth",
                                        block: "start",
                                      });
                                  }}
                                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-600 ${
                                    isSelected
                                      ? "bg-[#f4ecdc] text-[#72511f]"
                                      : "text-[#686157] hover:bg-[#f7f4ee]"
                                  }`}
                                >
                                  <LessonIcon completed={isComplete} />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-xs font-bold leading-relaxed">
                                      {lesson.title}
                                    </span>
                                    <span className="mt-1 block text-[10px] text-[#9a907f]">
                                      {lesson.duration}
                                    </span>
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            <footer className="py-8 text-center text-[11px] text-[#968d7f]">
              Keep going — every lesson brings your first order closer.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LMSDashboard() {
  const [authState, setAuthState] = useState("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCheck, setSessionCheck] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function checkSession() {
      setAuthState("checking");
      setErrorMessage("");
      try {
        const response = await fetch("/api/lms-auth", {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await readApiResponse(response, "LMS session check");
        if (!response.ok) {
          throw new Error(result.message || "Could not check your LMS session.");
        }

        if (result.authenticated && typeof result.email === "string") {
          setEmail(result.email);
          setAuthState("authenticated");
        } else {
          setAuthState("unauthenticated");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to check LMS session", error);
          setErrorMessage(error.message || "Could not check your LMS session.");
          setAuthState("error");
        }
      }
    }

    checkSession();
    return () => controller.abort();
  }, [sessionCheck]);

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/lms-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const result = await readApiResponse(response, "LMS login");
      if (!response.ok || !result.authenticated) {
        throw new Error(result.message || "Could not verify your course access.");
      }

      setEmail(result.email);
      setPassword("");
      setAuthState("authenticated");
    } catch (error) {
      console.error("Unable to log in to LMS", error);
      setErrorMessage(error.message || "Could not verify your course access.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setErrorMessage("");
    try {
      const response = await fetch("/api/lms-auth", {
        method: "DELETE",
        cache: "no-store",
      });
      const result = await readApiResponse(response, "LMS logout");
      if (!response.ok || result.authenticated) {
        throw new Error(result.message || "Could not sign out.");
      }

      setPassword("");
      setAuthState("unauthenticated");
    } catch (error) {
      console.error("Unable to log out of LMS", error);
      setErrorMessage(error.message || "Could not sign out.");
    }
  }

  if (authState === "authenticated") {
    return <LMSDashboardContent email={email} onLogout={handleLogout} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f6f1] px-5 py-10 text-[#201d18]">
      <section className="w-full max-w-md rounded-[26px] border border-[#eae5dc] bg-[#fffefa] p-6 shadow-[0_20px_60px_rgba(71,53,34,0.1)] sm:p-9">
        <a href="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202821] text-sm font-black tracking-tight text-[#e7b75e]">
            BD
          </span>
          <span className="text-sm font-extrabold tracking-tight">
            Import with BusyDev
          </span>
        </a>

        <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.19em] text-[#a07a3e]">
          Student learning portal
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Sign in to your course
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#777064]">
          Use the email address from your course purchase and the course password
          to continue learning.
        </p>

        {authState === "checking" && (
          <p role="status" className="mt-6 rounded-xl bg-[#f5f1e9] p-4 text-sm text-[#716858]">
            Checking your secure course session…
          </p>
        )}

        {authState === "error" && (
          <div className="mt-6" role="alert">
            <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => setSessionCheck((current) => current + 1)}
              className="mt-3 text-sm font-bold text-[#8b6426] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {authState === "unauthenticated" && (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="block text-xs font-bold text-[#39342c]">
              Purchase email
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-[#ded5c6] bg-white px-4 text-sm font-normal text-[#201d18] outline-none transition focus:border-[#c38d3b] focus:ring-2 focus:ring-[#c38d3b]/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-xs font-bold text-[#39342c]">
              Course password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-[#ded5c6] bg-white px-4 text-sm font-normal text-[#201d18] outline-none transition focus:border-[#c38d3b] focus:ring-2 focus:ring-[#c38d3b]/20"
                placeholder="Enter the course password"
              />
            </label>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-800"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#202821] px-5 py-3 text-sm font-extrabold text-[#fffaf1] transition hover:bg-[#354136] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Checking access…" : "Sign in"}
            </button>
          </form>
        )}

        <p className="mt-6 border-t border-[#eee9e0] pt-5 text-xs leading-relaxed text-[#81796e]">
          Access is available to course purchasers. Use the same email address
          entered during checkout.
        </p>
      </section>
    </main>
  );
}
