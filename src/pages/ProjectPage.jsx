import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ProjectPage({ projects = [] }) {
  const { slug } = useParams();
  const project = projects.find((item) => item.slug === slug);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-24 text-slate-950">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-[0_24px_55px_rgba(17,24,39,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Project not found</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">That project could not be found.</h1>
          <p className="mt-4 text-slate-600">The link may be outdated, or the project is no longer available.</p>
          <Link to="/" className="mt-8 inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Back to portfolio
          </Link>
        </div>
      </div>
    );
  }

  const returnSection = sessionStorage.getItem("returnSection") || "work";
  const galleryImages = Array.isArray(project.images) && project.images.length > 0
    ? project.images
    : project.image
      ? [project.image]
      : [];

  const goToNext = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const goToPrev = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#fefce8_100%)] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur-xl sm:px-10">
        <Link to={{ pathname: "/", hash: returnSection ? `#${returnSection}` : "" }} className="text-sm font-semibold text-slate-700 transition hover:text-slate-950">
          ← Back to home
        </Link>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8 lg:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_24px_55px_rgba(17,24,39,0.06)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Selected work</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{project.title}</h1>
            <p className="mt-4 text-lg text-slate-600">{project.subtitle}</p>
            <p className="mt-6 text-base leading-8 text-slate-700">{project.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/#work" className="inline-flex items-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Explore more work
              </Link>
              <a href="/#contact" className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-400">
                Work with us
              </a>
            </div>

           
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-3 shadow-[0_24px_55px_rgba(17,24,39,0.08)]">
            <div className="relative overflow-hidden rounded-[1.4rem]">
              <img
                src={galleryImages[activeImageIndex]}
                alt={`${project.title} preview ${activeImageIndex + 1}`}
                className="h-[420px] w-full object-cover sm:h-[500px]"
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-lg font-semibold text-slate-950 shadow-lg transition hover:bg-white"
                    aria-label="Show previous image"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-lg font-semibold text-slate-950 shadow-lg transition hover:bg-white"
                    aria-label="Show next image"
                  >
                    →
                  </button>

                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-slate-950/70 px-3 py-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={`h-2.5 w-2.5 rounded-full transition ${index === activeImageIndex ? "bg-white" : "bg-white/50"}`}
                        aria-label={`Show image ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`overflow-hidden rounded-[0.9rem] border transition ${index === activeImageIndex ? "border-slate-950" : "border-slate-200"}`}
                  >
                    <img src={image} alt={`${project.title} thumbnail ${index + 1}`} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
             {project.behanceLink && (
              <a
                href={project.behanceLink}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex text-sm font-semibold text-amber-700 transition hover:text-amber-800"
              >
                View full project on Behance →
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
