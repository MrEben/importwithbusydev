import { useEffect, useState } from "react";

export default function Typewriter({ phrases = [], className = "", typingSpeed = 80, deletingSpeed = 40, pause = 1200 }) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!phrases || phrases.length === 0) return;

    const current = phrases[index % phrases.length];
    let timeout;

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && text === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setIndex((i) => i + 1);
      }, 0);
    } else {
      timeout = setTimeout(() => {
        setText((t) => {
          const nextLength = isDeleting ? t.length - 1 : t.length + 1;
          return current.substring(0, nextLength);
        });
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index, phrases, typingSpeed, deletingSpeed, pause]);

  return (
    <h1 className={`typewriter ${className}`} aria-live="polite">
      {text}
      <span className="typewriter-cursor" aria-hidden>|</span>
    </h1>
  );
}
