import { useEffect, useState } from "react";
import nameLists from "../data/demo-activity-names.json";
import "./DemoActivityNotification.css";

const STORAGE_KEY = "demo-activity-name-cycle";
const DEMO_NAMES = nameLists.firstNames.flatMap((firstName) =>
  nameLists.lastNames.map((lastName) => `${firstName} ${lastName}`),
);

let fallbackDeck = shuffle([...DEMO_NAMES]);
let fallbackIndex = 0;

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function nextFallbackName() {
  if (fallbackIndex >= fallbackDeck.length) {
    fallbackDeck = shuffle([...DEMO_NAMES]);
    fallbackIndex = 0;
  }

  return fallbackDeck[fallbackIndex++];
}

function getNextDemoName() {
  try {
    const savedCycle = localStorage.getItem(STORAGE_KEY);
    let cycle;

    if (savedCycle) {
      const parsedCycle = JSON.parse(savedCycle);
      const isValidCycle =
        Array.isArray(parsedCycle.names) &&
        parsedCycle.names.length === DEMO_NAMES.length &&
        parsedCycle.names.every((name) => DEMO_NAMES.includes(name)) &&
        Number.isInteger(parsedCycle.nextIndex) &&
        parsedCycle.nextIndex >= 0 &&
        parsedCycle.nextIndex <= parsedCycle.names.length;

      cycle = isValidCycle
        ? parsedCycle
        : { names: shuffle([...DEMO_NAMES]), nextIndex: 0 };
    } else {
      cycle = { names: shuffle([...DEMO_NAMES]), nextIndex: 0 };
    }

    if (cycle.nextIndex >= cycle.names.length) {
      cycle = { names: shuffle([...DEMO_NAMES]), nextIndex: 0 };
    }

    const name = cycle.names[cycle.nextIndex];
    cycle.nextIndex += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cycle));
    return name;
  } catch (error) {
    console.error("Unable to save demo activity name rotation", error);
    return nextFallbackName();
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function DemoActivityNotification() {
  const [name, setName] = useState("");

  useEffect(() => {
    let showTimeout;
    let hideTimeout;

    function scheduleNext() {
      showTimeout = window.setTimeout(() => {
        setName(getNextDemoName());
        hideTimeout = window.setTimeout(() => {
          setName("");
          scheduleNext();
        }, 6500);
      }, randomBetween(15000, 30000));
    }

    scheduleNext();
    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, []);

  if (!name) return null;

  return (
    <aside
      className="demo-activity"
      aria-live="polite"
      aria-label="Sample activity notification"
      role="status"
    >
      <div className="demo-activity__header">
        <span className="demo-activity__badge">Notification</span>
        <button
          className="demo-activity__close"
          type="button"
          aria-label="Dismiss sample activity notification"
          onClick={() => setName("")}
        >
          ×
        </button>
      </div>
      <strong>{name}</strong>
      <p>enrolled for the Complete Importation Masterclass.</p>
      <small>one minute ago</small>
    </aside>
  );
}
