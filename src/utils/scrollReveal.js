export function initScrollReveal(root = document) {
  if (!root || typeof IntersectionObserver === "undefined") return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  const els = root.querySelectorAll(".reveal");
  els.forEach((el) => observer.observe(el));

  return observer;
}
