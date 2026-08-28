import { useEffect } from "react";

export default function MetaPixel({ id = import.meta.env.VITE_META_PIXEL_ID }) {
  useEffect(() => {
    if (!id) return;

    const initializedIds = (window.__busydevMetaPixelInitializedIds ||= new Set());

    if (initializedIds.has(id)) {
      window.fbq?.("track", "PageView");
      return;
    }

    if (window.fbq) {
      window.fbq("init", id);
      window.fbq("track", "PageView");
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
      window.fbq("track", "PageView");
      initializedIds.add(id);
    } catch {
      // ignore
    }
  }, [id]);

  return null;
}
