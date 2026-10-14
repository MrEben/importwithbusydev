import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams,Link } from "react-router-dom";
import { COURSE_ADD_ONS, COACHING_PRICE_GHS } from "../data/course-offers.js";
import { fetchCourseCurriculum } from "../utils/fetchCourseCurriculum.js";
import { readApiResponse } from "../utils/readApiResponse.js";

const progressStorageKey = "busydev-lms-completed-lessons";
const themeStorageKey = "busydev-lms-theme";
const formatGhs = (amount) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);

function readSavedTheme() {
  try {
    return window.localStorage.getItem(themeStorageKey) === "dark";
  } catch (error) {
    console.error("Unable to load LMS appearance preference:", error);
    return false;
  }
}

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

function readCompletedLessons(lessonIds) {
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
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${completed
        ? "bg-emerald-100 text-emerald-700"
        : "bg-[#f0f2f7] text-[#737985]"
        }`}
    >
      {completed ? "✓" : "▶"}
    </span>
  );
}

function LMSDashboardContent({
  curriculum,
  email,
  packages,
  addOnDownloads,
  addonPaymentNotice,
  onLogout,
}) {
  const courseModules = useMemo(
    () =>
      curriculum.sections.map((section, moduleIndex) => ({
        id: `module-${moduleIndex + 1}`,
        title: section.title,
        lessons: section.lessons.map((lesson, lessonIndex) => ({
          id: `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
          title: lesson.name,
          duration: lesson.time,
          videoUrl: lesson.videoUrl,
          resources: lesson.resources,
        })),
      })),
    [curriculum],
  );
  const allLessons = useMemo(
    () =>
      courseModules.flatMap((module) =>
        module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id })),
      ),
    [courseModules],
  );
  const lessonIds = useMemo(
    () => new Set(allLessons.map((lesson) => lesson.id)),
    [allLessons],
  );
  const [completedLessons, setCompletedLessons] = useState(() =>
    readCompletedLessons(lessonIds),
  );
  const [isDarkMode, setIsDarkMode] = useState(readSavedTheme);
  const [selectedLessonId, setSelectedLessonId] = useState(allLessons[0].id);
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedAddOnId, setSelectedAddOnId] = useState(null);
  const [isCoachingModalOpen, setIsCoachingModalOpen] = useState(false);
  const [isStartingAddOnPayment, setIsStartingAddOnPayment] = useState(false);
  const [addOnPaymentError, setAddOnPaymentError] = useState("");
  const profileMenuRef = useRef(null);
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
    try {
      window.localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");
    } catch (error) {
      console.error("Unable to save LMS appearance preference:", error);
    }
  }, [isDarkMode]);

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
    if (!isProfileMenuOpen) return undefined;

    function closeProfileMenuOnOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeProfileMenuOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeProfileMenuOnOutsideClick);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (
      !isMobileMenuOpen &&
      !isProfileMenuOpen &&
      !isSettingsOpen &&
      !selectedAddOnId &&
      !isCoachingModalOpen
    ) {
      return undefined;
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsSettingsOpen(false);
        setSelectedAddOnId(null);
        setIsCoachingModalOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen, isProfileMenuOpen, isSettingsOpen, selectedAddOnId, isCoachingModalOpen]);

  const purchasedAddOnIds = useMemo(
    () => new Set(packages.flatMap((coursePackage) => coursePackage.addOnIds)),
    [packages],
  );
  const selectedAddOn = COURSE_ADD_ONS.find(
    (addOn) => addOn.id === selectedAddOnId,
  );

  async function startAddOnPayment() {
    if (!selectedAddOn && !isCoachingModalOpen) return;
    setIsStartingAddOnPayment(true);
    setAddOnPaymentError("");

    try {
      const response = await fetch("/api/initialize-addon-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedAddOn
            ? { addOnId: selectedAddOn.id }
            : { productId: "one-on-one-coaching" },
        ),
      });
      const result = await readApiResponse(response, "LMS payment setup");
      if (!response.ok || typeof result.authorizationUrl !== "string") {
        throw new Error(result.message || "Could not start payment. Please try again.");
      }

      window.location.assign(result.authorizationUrl);
    } catch (error) {
      console.error("Unable to start LMS payment", error);
      setAddOnPaymentError(error.message || "Could not start payment. Please try again.");
      setIsStartingAddOnPayment(false);
    }
  }

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
  }, [courseModules, search]);

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
    <div
      data-theme={isDarkMode ? "dark" : "light"}
      className="lms-dashboard min-h-screen bg-[var(--lms-page)] font-[Inter,sans-serif] text-[var(--lms-ink)]"
    >
      <header className="sticky top-0 z-20 border-b border-[var(--lms-border)] bg-[var(--lms-surface)]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open course menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="lms-course-sidebar"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--lms-border)] text-[var(--lms-muted)] transition hover:bg-[var(--lms-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)] md:hidden"
            >
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <a
              href="/"
              className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--lms-blue)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--lms-blue)] text-sm font-black tracking-tight text-[var(--lms-on-blue)]">
                BD
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold leading-tight tracking-tight">
                  Import with BusyDev
                </span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--lms-muted)]">
                  Student learning portal
                </span>
              </span>
            </a>
          </div>
          <div
            ref={profileMenuRef}
            className="relative"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setIsProfileMenuOpen(false);
              }
            }}
          >
            <button
              type="button"
              aria-label="Open profile menu"
              aria-expanded={isProfileMenuOpen}
              aria-controls="lms-profile-menu"
              onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface)] text-[var(--lms-muted)] transition hover:border-[var(--lms-blue)] hover:text-[var(--lms-blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)]"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M5 20c.5-3.4 3.2-5.5 7-5.5s6.5 2.1 7 5.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {isProfileMenuOpen && (
              <div
                id="lms-profile-menu"
                className="absolute right-0 top-12 z-40 w-64 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] p-2 shadow-lg"
              >
                <p className="truncate px-3 py-2 text-xs font-semibold text-[var(--lms-muted)]">
                  {email}
                </p>
                <div className="my-1 border-t border-[var(--lms-border)]" />
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-[var(--lms-ink)] hover:bg-[var(--lms-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lms-blue)]"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--lms-muted)]"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8.4 2.8h3.2l.5 2a7 7 0 0 1 1.4.8l1.9-.7 1.6 2.8-1.4 1.5v1.6l1.4 1.5-1.6 2.8-1.9-.7a7 7 0 0 1-1.4.8l-.5 2H8.4l-.5-2a7 7 0 0 1-1.4-.8l-1.9.7L3 12.3l1.4-1.5V9.2L3 7.7l1.6-2.8 1.9.7a7 7 0 0 1 1.4-.8l.5-2Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="2.2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  Settings
                </button>
                {/* <a
                  href="/"
                  className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold text-[var(--lms-ink)] hover:bg-[var(--lms-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lms-blue)]"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-[var(--lms-muted)]"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v10A1.5 1.5 0 0 0 4.5 17h10a1.5 1.5 0 0 0 1.5-1.5V12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 3h7v7m0-7-8 8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back to site
                </a> */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M8 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H8m4-3 4-4-4-4m4 4H7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {(selectedAddOn || isCoachingModalOpen) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close purchase"
            onClick={() => {
              setSelectedAddOnId(null);
              setIsCoachingModalOpen(false);
            }}
            className="absolute inset-0 bg-black/50"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="lms-purchase-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] p-6 text-[var(--lms-ink)] shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="lms-purchase-title" className="text-xl font-extrabold">
                  {isCoachingModalOpen ? "Get one-on-one coaching" : "Add this to your course"}
                </h2>
                <p className="mt-2 text-sm text-[var(--lms-muted)]">
                  {isCoachingModalOpen
                    ? "You’re about to pay for one-on-one coaching using your signed-in account."
                    : "This add-on will be added to your existing LMS account."}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close purchase"
                onClick={() => {
                  setSelectedAddOnId(null);
                  setIsCoachingModalOpen(false);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xl text-[var(--lms-muted)] hover:bg-[var(--lms-soft)]"
              >
                ×
              </button>
            </div>
            <div className="mt-5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-page)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold">
                    {selectedAddOn?.name ?? "One-on-one coaching"}
                  </h3>
                  {selectedAddOn && (
                    <p className="mt-1 text-sm leading-relaxed text-[var(--lms-muted)]">
                      {selectedAddOn.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-extrabold text-[var(--lms-blue)]">
                  {formatGhs(selectedAddOn?.priceGhs ?? COACHING_PRICE_GHS)}
                </span>
              </div>
              <p className="mt-3 border-t border-[var(--lms-border)] pt-3 text-xs text-[var(--lms-muted)]">
                This payment will use your signed-in email: {email}
              </p>
            </div>
            {addOnPaymentError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {addOnPaymentError}
              </p>
            )}
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedAddOnId(null);
                  setIsCoachingModalOpen(false);
                }}
                disabled={isStartingAddOnPayment}
                className="min-h-11 rounded-lg border border-[var(--lms-border)] px-5 py-2 text-sm font-bold hover:bg-[var(--lms-soft)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startAddOnPayment}
                disabled={isStartingAddOnPayment}
                className="lms-addon-payment-button min-h-11 rounded-lg bg-[var(--lms-blue)] px-5 py-2 text-sm font-bold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isStartingAddOnPayment
                  ? "Connecting to Paystack…"
                  : `Pay ${formatGhs(selectedAddOn?.priceGhs ?? COACHING_PRICE_GHS)} with Paystack`}
              </button>
            </div>
          </section>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="lms-settings-title"
            className="relative z-10 w-full max-w-md rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] p-6 text-[var(--lms-ink)] shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="lms-settings-title" className="text-xl font-extrabold">
                  Settings
                </h2>
                <p className="mt-1 text-sm text-[var(--lms-muted)]">
                  Customize your learning portal.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setIsSettingsOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-xl text-[var(--lms-muted)] hover:bg-[var(--lms-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--lms-blue)]"
              >
                ×
              </button>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-[var(--lms-border)] p-4">
              <div>
                <p className="font-bold">Dark mode</p>
                <p className="mt-1 text-sm text-[var(--lms-muted)]">
                  {isDarkMode ? "Dark appearance is on" : "Light appearance is on"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDarkMode}
                aria-label="Dark mode"
                onClick={() => setIsDarkMode((enabled) => !enabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)] ${isDarkMode ? "bg-[var(--lms-blue)]" : "bg-slate-300"
                  }`}
              >
                <span
                  className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="min-h-10 rounded-md bg-[var(--lms-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--lms-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)]"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      <div className="mx-auto grid max-w-[1440px] md:grid-cols-[272px_minmax(0,1fr)]">
        {isMobileMenuOpen && (
          <button
            type="button"
            aria-label="Close course menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[72px] z-30 bg-[#202124]/40 md:hidden"
          />
        )}
        <aside
          id="lms-course-sidebar"
          role={isMobileMenuOpen ? "dialog" : undefined}
          aria-modal={isMobileMenuOpen ? "true" : undefined}
          aria-label={isMobileMenuOpen ? "Course menu" : undefined}
          aria-hidden={isMobileViewport && !isMobileMenuOpen}
          inert={isMobileViewport && !isMobileMenuOpen}
          className={`fixed bottom-0 left-0 top-[72px] z-40 w-[min(88vw,320px)] overflow-y-auto border-r border-[var(--lms-border)] bg-[var(--lms-surface)] px-5 py-6 shadow-sm transition-[transform,visibility] duration-300 md:sticky md:top-[72px] md:z-auto md:h-[calc(100vh-72px)] md:shadow-none md:px-6 ${isMobileMenuOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full"
            } md:visible md:translate-x-0`}
        >
          <div className="mb-5 flex items-center justify-between md:hidden">
            <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--lms-muted)]">
              Course menu
            </span>
            <button
              type="button"
              aria-label="Close course menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lms-border)] text-lg text-[var(--lms-muted)] hover:bg-[var(--lms-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)]"
            >
              ×
            </button>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.19em] text-[var(--lms-blue)]">
              Your course
            </p>
            <h1 className="mt-2 text-lg font-extrabold leading-snug tracking-tight">
              Importation Masterclass
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--lms-muted)]">
              Your start-to-finish guide to sourcing, shipping, and selling.
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-[var(--lms-soft)] p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold">Course progress</span>
              <span className="font-extrabold text-[var(--lms-blue)]">{progress}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[var(--lms-track)]"
              role="progressbar"
              aria-label="Course progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[var(--lms-blue)] transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-[var(--lms-muted)]">
              {completedLessons.length} of {allLessons.length} lessons complete
            </p>
          </div>

          <label className="mb-4 block">
            <span className="sr-only">Search lessons</span>
            <span className="flex items-center gap-2 rounded-lg border border-[var(--lms-border)] bg-white px-3">
              <svg
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-[var(--lms-muted)]"
                viewBox="0 0 20 20"
                fill="none"
              >
                <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
                <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                className="h-10 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--lms-muted)]"
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
                  className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--lms-muted)]"
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
                          className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--lms-blue)] ${isSelected
                            ? "bg-[var(--lms-soft-blue)] text-[var(--lms-blue)]"
                            : "text-[var(--lms-muted)] hover:bg-[var(--lms-soft)]"
                            }`}
                        >
                          <LessonIcon completed={isComplete} />
                          <span className="min-w-0">
                            <span className="block text-xs font-bold leading-snug">
                              {lesson.title}
                            </span>
                            <span className="mt-1 block text-[10px] text-[var(--lms-muted)]">
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
              <p className="rounded-lg bg-[var(--lms-soft)] p-3 text-xs leading-relaxed text-[var(--lms-muted)]">
                No lessons match “{search}”. Try another search.
              </p>
            )}
          </nav>
          <p className="mt-8 border-t border-[var(--lms-border)] pt-4 text-[11px] leading-relaxed text-[var(--lms-muted)]">
            Need help with your course? Contact the BusyDev support team.
          </p>
        </aside>

        <main className="min-w-0 px-5 pt-6 pb-8 sm:px-8 sm:py-10 lg:px-12">
          <div className="mx-auto max-w-[960px]">
            <p className="text-xs font-semibold text-[var(--lms-muted)]">
              My learning <span className="px-1.5 text-[var(--lms-muted)]">/</span>{" "}
              {selectedModule.title}
            </p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                {/* <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--lms-blue)]">
                  Your learning dashboard
                </p> */}
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-[40px]">
                  Welcome to your classroom.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--lms-muted)]">
                  Pick up where you left off and build your import business one
                  practical step at a time.
                </p>
              </div>
              <span className="rounded-full bg-[var(--lms-soft-blue)] px-3 py-1.5 text-[11px] font-bold text-[var(--lms-muted)]">
                {allLessons.length} lessons · Self-paced
              </span>
            </div>

            <section
              aria-labelledby="purchases-title"
              className="mt-6 rounded-lg border border-[var(--lms-border)] bg-white p-5 sm:p-6"
            >
              <h3
                id="purchases-title"
                className="text-sm font-extrabold text-[var(--lms-ink)]"
              >
                Your purchased package{packages.length === 1 ? "" : "s"}
              </h3>
              <div className="mt-4 space-y-4">
                {packages.map((coursePackage, index) => (
                  <article
                    key={`${coursePackage.packageId}-${coursePackage.purchasedAt ?? index}`}
                    className="rounded-lg bg-[var(--lms-page)] p-4"
                  >
                    <h4 className="font-bold text-[var(--lms-ink)]">
                      {coursePackage.packageName}
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-[var(--lms-muted)]">
                      <li className="flex flex-wrap items-center gap-2">
                        <span aria-hidden="true" className="text-emerald-700">
                          ✓
                        </span>
                        <span>Complete Importation Masterclass</span>
                      </li>
                      {COURSE_ADD_ONS.map((addOn) => {
                        const purchased = purchasedAddOnIds.has(addOn.id);
                        const downloadUrl = addOnDownloads[addOn.id];

                        return (
                          <li
                            key={addOn.id}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <span
                              aria-hidden="true"
                              className={purchased ? "text-emerald-700" : "text-[var(--lms-muted)]"}
                            >
                              {purchased ? "✓" : "–"}
                            </span>
                            <span className={purchased ? "" : "line-through"}>
                              {addOn.name}
                            </span>
                            {purchased ? (
                              downloadUrl ? (
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 underline decoration-emerald-700 underline-offset-2 hover:bg-emerald-200"
                                >
                                  Download
                                </a>
                              ) : (
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                                  Download unavailable
                                </span>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAddOnPaymentError("");
                                  setSelectedAddOnId(addOn.id);
                                }}
                                className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 underline decoration-amber-700 underline-offset-2 hover:bg-amber-200"
                              >
                                Get it
                              </button>
                            )}
                          </li>
                        );
                      })}
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setAddOnPaymentError("");
                            setIsCoachingModalOpen(true);
                          }}
                          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[var(--lms-blue)] underline decoration-[var(--lms-blue)] underline-offset-4 hover:text-[var(--lms-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)]"
                        >
                          Get One-on-One Coaching
                          <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
                            <path d="M11 3h6v6m0-6-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M15 11v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </article>
                ))}
              </div>
            </section>
            {addonPaymentNotice && (
              <p
                role={addonPaymentNotice.type === "success" ? "status" : "alert"}
                className={`mt-4 rounded-lg border p-4 text-sm ${addonPaymentNotice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
                  }`}
              >
                {addonPaymentNotice.message}
              </p>
            )}

            {/* <section
              aria-labelledby="continue-title"
              className="relative mt-8 overflow-hidden rounded-lg bg-[var(--lms-blue)] p-6 text-[var(--lms-on-blue)] shadow-sm sm:p-9"
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[1px] border-[#ffffff]/20"
              />
              <div
                aria-hidden="true"
                className="absolute -right-5 -top-12 h-52 w-52 rounded-full border-[1px] border-[#ffffff]/20"
              />
              <div className="relative max-w-xl">
                <span className="inline-flex rounded-full border border-[#ffffff]/30 bg-[var(--lms-surface)]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--lms-on-blue)]">
                  {completedLessons.length === 0 ? "Start learning" : "Continue learning"}
                </span>
                <h3
                  id="continue-title"
                  className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl"
                >
                  {selectedLesson.title}
                </h3>
                <p className="mt-2 text-sm text-[#e2e5eb]">
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
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--lms-blue)] px-5 py-3 text-sm font-extrabold text-[var(--lms-on-blue)] transition hover:bg-[var(--lms-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0038d9]"
                >
                  {completedLessons.includes(selectedLesson.id)
                    ? "Review lesson"
                    : "Open lesson"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </section> */}

            <section
              id="lesson-workspace"
              aria-labelledby="lesson-title"
              className="mt-8 scroll-mt-24 rounded-lg border border-[var(--lms-border)] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--lms-blue)]">
                    Lesson workspace
                  </p>
                  <h3
                    id="lesson-title"
                    className="mt-2 text-2xl font-extrabold tracking-tight"
                  >
                    {selectedLesson.title}
                  </h3>
                </div>
                <span className="rounded-full bg-[var(--lms-soft)] px-3 py-1.5 text-xs font-bold text-[var(--lms-muted)]">
                  {selectedLesson.duration}
                </span>
              </div>

              <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-lg bg-[#000] text-center text-[var(--lms-on-blue)]">
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
                      className="flex h-16 w-16 items-center justify-center rounded-full border border-[#0645ff]/50 bg-[var(--lms-blue)]/10 text-[var(--lms-blue)]"
                    >
                      <svg className="ml-1 h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11 6.7a1.6 1.6 0 0 1 0 2.8l-11 6.7c-.7.4-1.6-.1-1.6-.9V4.8Z" />
                      </svg>
                    </span>
                    <p className="mt-5 text-sm font-extrabold sm:text-base">
                      Lesson video
                    </p>
                    <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-[#e2e5eb]">
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
                    <p className="mt-2 max-w-md text-xs leading-relaxed text-[#e2e5eb]">
                      Use a YouTube, Gumlet, or Vimeo link, or a direct MP4, WebM, or Ogg video URL.
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--lms-muted)]">
                Double tap on the video to open in full screen
              </p>
              <div className="mt-6 border-t border-[var(--lms-border)] pt-5">
                <section
                  aria-labelledby="lesson-resources-title"
                  className="rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] p-5 sm:p-6"
                >
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--lms-blue)]">
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
                      <h5 className="text-xs font-extrabold text-[var(--lms-ink)]">
                        PowerPoint slides
                      </h5>
                      {selectedLesson.resources?.powerpointUrl ? (
                        <a
                          href={selectedLesson.resources.powerpointUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[var(--lms-blue)] underline decoration-[var(--lms-blue)] underline-offset-4 hover:text-[var(--lms-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)]"
                        >
                          Download PowerPoint slides
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <p className="mt-2 text-xs leading-relaxed text-[var(--lms-muted)]">
                          No PowerPoint slides have been added yet.
                        </p>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-extrabold text-[var(--lms-ink)]">
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
                                  className="inline-flex items-start gap-2 text-xs font-semibold leading-relaxed text-[var(--lms-blue)] underline decoration-[var(--lms-blue)] underline-offset-4 hover:text-[var(--lms-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)]"
                                >
                                  <span aria-hidden="true">▶</span>
                                  {youtubeLink.title || `YouTube resource ${index + 1}`}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs leading-relaxed text-[var(--lms-muted)]">
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
                    className={`rounded-full border px-4 py-2.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)] ${completedLessons.includes(selectedLesson.id)
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      : "border-[var(--lms-border)] bg-white text-[var(--lms-muted)] hover:bg-[var(--lms-soft)]"
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
                    className="rounded-full bg-[var(--lms-blue)] px-5 py-2.5 text-xs font-bold text-[var(--lms-on-blue)] transition hover:bg-[var(--lms-blue-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lms-blue)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next lesson <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="modules-title">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--lms-blue)]">
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
                      className="overflow-hidden rounded-lg border border-[var(--lms-border)] bg-white transition hover:border-[var(--lms-blue)] hover:shadow-sm"
                    >
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={moduleLessonsId}
                        onClick={() =>
                          setExpandedModuleId(isExpanded ? null : module.id)
                        }
                        className="w-full p-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[var(--lms-blue)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--lms-soft)] text-xs font-extrabold text-[var(--lms-blue)]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--lms-muted)]">
                            {completedCount}/{module.lessons.length} lessons
                          </span>
                        </div>
                        <span className="mt-4 flex items-center justify-between gap-3 text-sm font-extrabold">
                          {module.title}
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-base text-[var(--lms-blue)]"
                          >
                            {isExpanded ? "−" : "+"}
                          </span>
                        </span>
                        <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-[#e2e5eb]">
                          <span
                            className="block h-full rounded-full bg-[var(--lms-blue)]"
                            style={{ width: `${moduleProgress}%` }}
                          />
                        </span>
                      </button>
                      {isExpanded && (
                        <ul
                          id={moduleLessonsId}
                          className="space-y-1 border-t border-[var(--lms-border)] px-3 py-3"
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
                                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--lms-blue)] ${isSelected
                                    ? "bg-[var(--lms-soft-blue)] text-[var(--lms-blue)]"
                                    : "text-[var(--lms-muted)] hover:bg-[var(--lms-soft)]"
                                    }`}
                                >
                                  <LessonIcon completed={isComplete} />
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-xs font-bold leading-relaxed">
                                      {lesson.title}
                                    </span>
                                    <span className="mt-1 block text-[10px] text-[var(--lms-muted)]">
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
            <footer className="py-8 text-center text-[11px] text-[var(--lms-muted)]">
              Keep going — every lesson brings your first order closer.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function LMSDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [authState, setAuthState] = useState("checking");
  const [email, setEmail] = useState("");
  const [packages, setPackages] = useState([]);
  const [addOnDownloads, setAddOnDownloads] = useState({});
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCheck, setSessionCheck] = useState(0);
  const [curriculum, setCurriculum] = useState(null);
  const [curriculumError, setCurriculumError] = useState("");
  const [curriculumCheck, setCurriculumCheck] = useState(0);
  const [addonPaymentNotice, setAddonPaymentNotice] = useState(null);
  const verifiedAddonReferences = useRef(new Set());
  const addonPaymentReference =
    searchParams.get("reference") ?? searchParams.get("trxref");
  const addonPaymentCallback = searchParams.get("addonPayment") === "1";

  useEffect(() => {
    const controller = new AbortController();

    async function loadCurriculum() {
      setCurriculumError("");
      try {
        setCurriculum(
          await fetchCourseCurriculum({ signal: controller.signal }),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load LMS course curriculum", error);
          setCurriculumError(error.message || "Could not load course content.");
        }
      }
    }

    loadCurriculum();
    return () => controller.abort();
  }, [curriculumCheck]);

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
          setPackages(Array.isArray(result.packages) ? result.packages : []);
          setAddOnDownloads(
            result.addOnDownloads && typeof result.addOnDownloads === "object"
              ? result.addOnDownloads
              : {},
          );
          setAuthState("authenticated");
        } else {
          setPackages([]);
          setAddOnDownloads({});
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

  useEffect(() => {
    if (
      authState !== "authenticated" ||
      !addonPaymentCallback ||
      !addonPaymentReference ||
      verifiedAddonReferences.current.has(addonPaymentReference)
    ) {
      return undefined;
    }
    verifiedAddonReferences.current.add(addonPaymentReference);
    const controller = new AbortController();

    async function verifyAddonPayment() {
      try {
        const response = await fetch(
          `/api/verify-addon-payment?reference=${encodeURIComponent(addonPaymentReference)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const result = await readApiResponse(response, "Add-on payment verification");
        if (!response.ok) {
          throw new Error(result.message || "Could not verify your add-on payment.");
        }

        if (!result.verified) {
          setAddonPaymentNotice({
            type: "error",
            message: "Your add-on payment could not be confirmed. No changes were made to your account.",
          });
        } else {
          setAddonPaymentNotice({
            type: "success",
            message: `${result.addOnName} has been added to your existing account.`,
          });
          setSessionCheck((current) => current + 1);
        }
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.delete("addonPayment");
          next.delete("reference");
          next.delete("trxref");
          return next;
        }, { replace: true });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to verify LMS add-on payment", error);
          setAddonPaymentNotice({
            type: "error",
            message: error.message || "Could not verify your add-on payment. Reload this page to retry.",
          });
        }
      }
    }

    verifyAddonPayment();
    return () => controller.abort();
  }, [
    addonPaymentCallback,
    addonPaymentReference,
    authState,
    setSearchParams,
  ]);

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
      setPackages(Array.isArray(result.packages) ? result.packages : []);
      setAddOnDownloads(
        result.addOnDownloads && typeof result.addOnDownloads === "object"
          ? result.addOnDownloads
          : {},
      );
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
      setPackages([]);
      setAddOnDownloads({});
      setAuthState("unauthenticated");
    } catch (error) {
      console.error("Unable to log out of LMS", error);
      setErrorMessage(error.message || "Could not sign out.");
    }
  }

  if (authState === "authenticated") {
    if (!curriculum) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#f3f6fb] px-5 py-9 font-[Inter,sans-serif] text-[#202124]">
          <section className="w-full max-w-md rounded-lg border border-[#e2e5eb] bg-white p-6 shadow-sm sm:p-9">
            {curriculumError ? (
              <div role="alert">
                <h1 className="text-2xl font-extrabold">Course content unavailable</h1>
                <p className="mt-3 text-sm leading-relaxed text-[#737985]">
                  {curriculumError}
                </p>
                <button
                  type="button"
                  onClick={() => setCurriculumCheck((current) => current + 1)}
                  className="mt-5 rounded-lg bg-[#0645ff] px-5 py-3 text-sm font-extrabold text-white"
                >
                  Try again
                </button>
              </div>
            ) : (
              <p role="status" className="text-sm text-[#737985]">
                Loading course content…
              </p>
            )}
          </section>
        </main>
      );
    }

    return (
      <LMSDashboardContent
        curriculum={curriculum}
        email={email}
        packages={packages}
        addOnDownloads={addOnDownloads}
        addonPaymentNotice={addonPaymentNotice}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6fb] px-5 py-9 font-[Inter,sans-serif] text-[#202124]">
      <section className="w-full max-w-md rounded-lg border border-[#e2e5eb] bg-[#ffffff] p-6 shadow-sm sm:p-9">
        <a href="/" className="inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0645ff] text-sm font-black tracking-tight text-[#ffffff]">
            BD
          </span>
          <span className="text-sm font-extrabold tracking-tight">
            Import with BusyDev
          </span>
        </a>

        {/* <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.19em] text-[#0645ff]">
          Student learning portal
        </p> */}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Sign in to your course
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#737985]">
          Use the email address from your course purchase and the course password
          to continue learning.
        </p>

        {authState === "checking" && (
          <p role="status" className="mt-6 rounded-lg bg-[#f0f2f7] p-4 text-sm text-[#737985]">
            Checking your secure course session…
          </p>
        )}

        {authState === "error" && (
          <div className="mt-6" role="alert">
            <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => setSessionCheck((current) => current + 1)}
              className="mt-3 text-sm font-bold text-[#0645ff] underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {authState === "unauthenticated" && (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <label className="block text-xs font-bold text-[#202124]">
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
                className="mt-2 h-12 w-full rounded-lg border border-[#e2e5eb] bg-white px-4 text-sm font-normal text-[#202124] outline-none transition focus:border-[#0645ff] focus:ring-2 focus:ring-[#0645ff]/20"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-xs font-bold text-[#202124]">
              Course password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-lg border border-[#e2e5eb] bg-white px-4 text-sm font-normal text-[#202124] outline-none transition focus:border-[#0645ff] focus:ring-2 focus:ring-[#0645ff]/20"
                placeholder="Enter the course password"
              />
            </label>

            {errorMessage && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-800"
              >
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-12 w-full items-center justify-center rounded-lg bg-[#0645ff] px-5 py-3 text-sm font-extrabold text-[#fffaf1] transition hover:bg-[#0038d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0645ff] disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Checking access…" : "Sign in"}
            </button>
            <p className="text-left text-sm text-[#202124]">
              Don&apos;t have an account?{" "}
              <a
                href="https://importwithbusydev.vercel.app/upsell"
                className="font-bold text-[#0645ff] underline underline-offset-2 hover:text-[#0038d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0645ff]"
              >
                Enroll in the Course Now
              </a>
            </p>
          </form>
        )}

        <p className="mt-6 border-t border-[#e2e5eb] pt-5 text-xs leading-relaxed text-[#737985]">
          Access is available to course purchasers. Use the same email address
          entered during checkout.
        </p>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 text-sm text-slate-600 sm:px-10">
          Need help? Send me a message on whatsapp{" "}
          <Link className="font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-800" to="https://tinyurl.com/ymanwze6">
            Send Message
          </Link>
        </div>
      </section>
    </main>
  );
}
