import { useRef } from "react";
import { Link } from "react-router-dom";

function getCurrentSection() {
  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!sections.length) return "work";

  const viewportMid = window.innerHeight * 0.35;
  let currentSection = "work";
  let closestDistance = Infinity;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top - viewportMid);
    if (distance < closestDistance) {
      closestDistance = distance;
      currentSection = section.id;
    }
  });

  return currentSection;
}

export default function ProjectCarousel({ projects = [] }) {
  const containerRef = useRef(null);

  function scrollBy(offset) {
    containerRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div ref={containerRef} className="flex gap-6 overflow-x-auto pb-4 px-0 sm:px-2 scroll-smooth">
        {projects.map((p, i) => (
          <div key={i} className="group relative min-w-[260px] sm:min-w-[320px] md:min-w-[360px] flex-shrink-0 rounded-[1rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_24px_55px_rgba(17,24,39,0.06)]">
            <img src={p.image} alt={p.title} className="h-80 w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 transition-opacity opacity-0 group-hover:opacity-100 group-hover:bg-black/40 px-6 text-center">
              <h3 className="text-xl font-semibold text-white">{p.title}</h3>
              {p.subtitle && <p className="mt-2 text-sm text-white/90">{p.subtitle}</p>}
              <Link
                to={p.slug ? `/project/${p.slug}` : "/"}
                onClick={() => sessionStorage.setItem("returnSection", getCurrentSection())}
                className="mt-4 inline-flex cursor-pointer rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950"
              >
                View project
              </Link>
            </div>
          </div>
        ))}
        {/* Pinterest card: whole card clickable */}
        <a
          href="https://de.pinterest.com/aniagyeiodame/_pins/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative min-w-[260px] sm:min-w-[120px] md:min-w-[360px] flex-shrink-0 rounded-[2rem] overflow-hidden border border-slate-200/80 bg-[#93a09f] text-white shadow-[0_24px_55px_rgba(17,24,39,0.06)]"
        >
          <div className="h-80 flex flex-col items-center justify-center px-6 text-center">
            <h3 className="text-xl font-semibold">View other projects of BUSYDEV on Pinterest</h3>
            <p className="mt-2 text-sm opacity-90">Curated pins showcasing our packaging, ads and brand work.</p>
            <span className="mt-4 inline-flex cursor-pointer rounded-2xl border border-white px-4 py-2 text-sm font-semibold text-white bg-transparent">
              View projects
            </span>
          </div>
        </a>
      </div>

      <button onClick={() => scrollBy(-320)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow hover:bg-slate-50">‹</button>
      <button onClick={() => scrollBy(320)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white p-2 shadow hover:bg-slate-50">›</button>
    </div>
  );
}
