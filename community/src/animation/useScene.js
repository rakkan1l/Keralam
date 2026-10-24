import { useLayoutEffect, useRef } from 'react';
import { gsap } from './gsap.js';

/**
 * Runs a GSAP setup function scoped to the returned ref and reverts every
 * tween and ScrollTrigger on unmount. The setup receives `{ reduced }` so each
 * scene can skip or simplify motion for prefers-reduced-motion users.
 *
 * Content is always visible in the markup; animations only use `from` states,
 * so if JavaScript or GSAP fails the page stays fully readable.
 */
export function useScene(setup, deps = []) {
  const scope = useRef(null);

  useLayoutEffect(() => {
    const root = scope.current;
    if (!root) return undefined;
    const mm = gsap.matchMedia(root);
    mm.add(
      {
        reduced: '(prefers-reduced-motion: reduce)',
        motion: '(prefers-reduced-motion: no-preference)',
      },
      (context) => setup({ root, reduced: Boolean(context.conditions.reduced) }),
    );
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}

/** Fades and lifts every `[data-reveal]` element inside `root` as it scrolls into view. */
export function revealOnScroll(root, { y = 32, stagger = 0.08 } = {}) {
  const groups = new Map();
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    const group = el.closest('[data-reveal-group]') || el;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(el);
  });
  groups.forEach((items, trigger) => {
    gsap.from(items, {
      y,
      opacity: 0,
      duration: 1.1,
      stagger,
      scrollTrigger: { trigger, start: 'top 85%', once: true },
    });
  });
}
