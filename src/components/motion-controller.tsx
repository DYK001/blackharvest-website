"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Progressive enhancement only: server content is never hidden awaiting JS. */
export function MotionController() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = marker.current?.parentElement;
    if (!root || !window.matchMedia || !window.requestAnimationFrame) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1025px) and (hover: hover) and (pointer: fine)");
    if (!reduced.addEventListener || !desktop.addEventListener) return;
    let dispose = () => {};

    const setup = () => {
      dispose();
      if (reduced.matches) return;
      const animations = new Set<Animation>();
      const reveal = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal?.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          // Anchors, restored scroll positions and initial above-fold content stay still.
          if (!element.animate || element.getBoundingClientRect().top < 0) continue;
          const variant = element.dataset.reveal;
          const animation = element.animate(
            variant === "line"
              ? [{ transform: "scaleX(.94)", opacity: .75 }, { transform: "scaleX(1)", opacity: 1 }]
              : [{ transform: variant === "fade" ? "none" : "translateY(8px)", opacity: .78 }, { transform: "none", opacity: 1 }],
            { duration: desktop.matches ? 420 : 260, easing: "cubic-bezier(.2,.65,.3,1)" },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      }, { threshold: 0, rootMargin: "0px 0px 24px 0px" }) : null;
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
        if (element.getBoundingClientRect().top >= window.innerHeight) reveal?.observe(element);
      });

      let frame = 0;
      let geometryDirty = true;
      let pointerX = 0;
      let pointerY = 0;
      let pointerVisible = false;
      const hero = root.querySelector<HTMLElement>(".hero");
      const atmosphere = root.querySelector<HTMLElement>(".pointer-atmosphere");
      const media = [...root.querySelectorAll<HTMLElement>("[data-depth]")];
      const roadmap = root.querySelector<HTMLElement>(".roadmap-ledger");
      const targets = [hero, ...media, roadmap].filter((item): item is HTMLElement => Boolean(item));
      const active = new Set(targets);
      const visibility = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) active.add(target as HTMLElement);
          else active.delete(target as HTMLElement);
        });
        scheduleGeometry();
      }, { rootMargin: "100px" }) : null;

      const paint = () => {
        frame = 0;
        if (document.hidden) return;
        // Batch geometry reads before style writes. No React state or idle loop.
        const bounds = geometryDirty ? [...active].map((element) => [element, element.getBoundingClientRect()] as const) : [];
        geometryDirty = false;
        for (const [element, rect] of bounds) {
          if (element === hero) {
            const progress = clamp(-rect.top / rect.height);
            element.style.setProperty("--hero-scale", String(1 + progress * .045));
            element.style.setProperty("--hero-offset", `${Math.round(progress * 22)}px`);
            element.style.setProperty("--hero-shade", String(progress * .28));
          } else if (element === roadmap) {
            element.style.setProperty("--roadmap-trace", String(clamp((window.innerHeight * .65 - rect.top) / rect.height)));
          } else {
            const progress = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
            element.style.setProperty("--media-offset", `${(progress * 2 - 1) * 7}px`);
          }
        }
        if (atmosphere) {
          atmosphere.style.transform = `translate3d(${pointerX - 240}px, ${pointerY - 240}px, 0)`;
          atmosphere.style.opacity = pointerVisible ? "1" : "0";
        }
      };
      function schedule() {
        if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
      }
      function scheduleGeometry() {
        geometryDirty = true;
        schedule();
      }
      const pointer = (event: PointerEvent) => {
        pointerVisible = event.pointerType === "mouse";
        pointerX = event.clientX;
        pointerY = event.clientY;
        schedule();
      };
      const leave = () => { pointerVisible = false; schedule(); };
      const focus = () => { animations.forEach((animation) => animation.cancel()); animations.clear(); };
      root.addEventListener("focusin", focus);
      if (desktop.matches) {
        root.dataset.motion = "desktop";
        targets.forEach((target) => visibility?.observe(target));
        window.addEventListener("scroll", scheduleGeometry, { passive: true });
        window.addEventListener("resize", scheduleGeometry);
        window.addEventListener("pageshow", scheduleGeometry);
        document.addEventListener("visibilitychange", scheduleGeometry);
        root.addEventListener("pointermove", pointer, { passive: true });
        root.addEventListener("pointerleave", leave);
        window.addEventListener("blur", leave);
        schedule();
      }
      dispose = () => {
        reveal?.disconnect();
        visibility?.disconnect();
        animations.forEach((animation) => animation.cancel());
        cancelAnimationFrame(frame);
        delete root.dataset.motion;
        targets.forEach((element) => ["--hero-scale", "--hero-offset", "--hero-shade", "--media-offset", "--roadmap-trace"].forEach((property) => element.style.removeProperty(property)));
        atmosphere?.removeAttribute("style");
        root.removeEventListener("focusin", focus);
        window.removeEventListener("scroll", scheduleGeometry);
        window.removeEventListener("resize", scheduleGeometry);
        window.removeEventListener("pageshow", scheduleGeometry);
        document.removeEventListener("visibilitychange", scheduleGeometry);
        root.removeEventListener("pointermove", pointer);
        root.removeEventListener("pointerleave", leave);
        window.removeEventListener("blur", leave);
      };
    };
    setup();
    reduced.addEventListener("change", setup);
    desktop.addEventListener("change", setup);
    return () => { dispose(); reduced.removeEventListener("change", setup); desktop.removeEventListener("change", setup); };
  }, []);

  return <span ref={marker} className="pointer-atmosphere" aria-hidden="true" />;
}
