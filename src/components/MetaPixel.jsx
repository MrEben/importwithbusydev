import { useEffect, useRef } from "react";

export default function MetaPixel({ id = import.meta.env.PIXEL_ID }) {
  const pageViewTrackedForId = useRef(null);

  useEffect(() => {
    if (!id) return;

    const initializedIds = (window.__busydevMetaPixelInitializedIds ||= new Set());
    const trackPageView = () => {
      if (pageViewTrackedForId.current === id) return;
      window.fbq?.("track", "PageView");
      pageViewTrackedForId.current = id;
    };

    if (initializedIds.has(id)) {
      trackPageView();
      return;
    }

    if (window.fbq) {
      window.fbq("init", id);
      trackPageView();
      initializedIds.add(id);
      return;
    }

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    // init
    window.fbq = window.fbq || function () { (window.fbq.q = window.fbq.q || []).push(arguments); };
    try {
      window.fbq("init", id);
      trackPageView();
      initializedIds.add(id);
    } catch (error) {
      console.error("Meta Pixel initialization failed:", error);
    }
  }, [id]);

  return null;
}
