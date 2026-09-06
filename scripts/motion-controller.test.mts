import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/components/motion-controller.tsx", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;

function harness({ reduced = false, desktop = true, observer = true, raf = true } = {}) {
  class Events {
    listeners = new Map<string, Set<() => void>>();
    addEventListener(name: string, fn: () => void) { if (!this.listeners.has(name)) this.listeners.set(name, new Set()); this.listeners.get(name)!.add(fn); }
    removeEventListener(name: string, fn: () => void) { this.listeners.get(name)?.delete(fn); }
    emit(name: string) { this.listeners.get(name)?.forEach((fn) => fn()); }
    count(name: string) { return this.listeners.get(name)?.size ?? 0; }
  }
  const properties = new Map<string, string>();
  let top = -450;
  const hero = { style: { setProperty: (key: string, value: string) => properties.set(key, value), removeProperty: (key: string) => properties.delete(key) }, getBoundingClientRect: () => ({ top, height: 900 }) };
  const root = Object.assign(new Events(), { dataset: {} as Record<string, string>, querySelector: (selector: string) => selector === ".hero" ? hero : null, querySelectorAll: () => [] });
  const reduceQuery = Object.assign(new Events(), { matches: reduced });
  const desktopQuery = Object.assign(new Events(), { matches: desktop });
  let nextFrame = 0;
  const frames = new Map<number, () => void>();
  const request = (fn: () => void) => { frames.set(++nextFrame, fn); return nextFrame; };
  const cancel = (id: number) => { frames.delete(id); };
  const win = Object.assign(new Events(), { innerHeight: 900, matchMedia: (query: string) => query.includes("reduced-motion") ? reduceQuery : desktopQuery, ...(raf ? { requestAnimationFrame: request } : {}) });
  const doc = Object.assign(new Events(), { hidden: false });
  let cleanup: (() => void) | undefined;
  let observers = 0;
  class Observer { constructor() { observers++; } observe() {} unobserve() {} disconnect() { observers--; } }
  if (observer) Object.assign(win, { IntersectionObserver: Observer });
  const exports: { MotionController?: () => void } = {};
  vm.runInNewContext(code, {
    exports, window: win, document: doc,
    requestAnimationFrame: request, cancelAnimationFrame: cancel,
    ...(observer ? { IntersectionObserver: Observer } : {}),
    require: (name: string) => name === "react" ? { useEffect: (fn: () => () => void) => { cleanup = fn(); }, useRef: () => ({ current: { parentElement: root } }) } : { jsx: () => null },
  });
  exports.MotionController!();
  return { win, doc, root, frames, properties, reduceQuery, desktopQuery, observers: () => observers, cleanup: () => cleanup?.(), setTop: (value: number) => { top = value; }, flush: () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((fn) => fn()); } };
}

test("reduced motion starts with no observers, scroll handlers or frames", () => {
  const h = harness({ reduced: true });
  assert.equal(h.observers(), 0); assert.equal(h.win.count("scroll"), 0); assert.equal(h.frames.size, 0); assert.equal(h.root.dataset.motion, undefined);
  h.cleanup();
});
test("mobile keeps reveals but installs no continuous effects", () => {
  const h = harness({ desktop: false });
  assert.equal(h.win.count("scroll"), 0); assert.equal(h.root.count("pointermove"), 0); assert.equal(h.frames.size, 0);
  h.cleanup(); assert.equal(h.observers(), 0);
});
test("scroll frames coalesce, reverse correctly and stop at rest", () => {
  const h = harness();
  for (let i = 0; i < 30; i++) h.win.emit("scroll");
  assert.equal(h.frames.size, 1); h.flush(); assert.equal(h.frames.size, 0);
  assert.equal(Number(h.properties.get("--hero-scale")), 1.0225);
  h.setTop(0); h.win.emit("scroll"); h.flush(); assert.equal(h.properties.get("--hero-scale"), "1");
  h.cleanup(); assert.equal(h.win.count("scroll"), 0); assert.equal(h.root.count("pointermove"), 0); assert.equal(h.properties.size, 0);
});
test("changing reduced motion cancels work and clears all transforms", () => {
  const h = harness(); h.flush(); h.win.emit("scroll"); h.reduceQuery.matches = true; h.reduceQuery.emit("change");
  assert.equal(h.frames.size, 0); assert.equal(h.properties.size, 0); assert.equal(h.observers(), 0); assert.equal(h.root.dataset.motion, undefined);
  h.cleanup();
});
test("unsupported observer and frame APIs fail open", () => {
  const h = harness({ observer: false }); h.flush(); h.cleanup();
  const noFrames = harness({ raf: false }); assert.equal(noFrames.frames.size, 0); assert.equal(noFrames.observers(), 0); noFrames.cleanup();
});

