import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function move(e) {
      const x = e.clientX;
      const y = e.clientY;
      el.style.left = x + "px";
      el.style.top = y + "px";
    }

    function enter() {
      el.style.opacity = "1";
    }

    function leave() {
      el.style.opacity = "0";
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("pointerdown", enter);
    window.addEventListener("pointerup", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("pointerdown", enter);
      window.removeEventListener("pointerup", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="cursor-glow"
      style={{ position: "fixed", left: 0, top: 0, pointerEvents: "none" }}
    />
  );
}
