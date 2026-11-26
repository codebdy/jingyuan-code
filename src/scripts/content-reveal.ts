// One motion preset for all content cards, including Figma's boxless groups.
export function initContentReveal() {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>([
    '[data-reveal-card]', '[data-reveal-block]', '[data-catalog-card]', '[data-card-hover]',
    '[data-cert-card]', '[data-news-card]', '[data-case-card]', '[data-faq-row]', '.quality-step',
    '[data-home] .product-card', '[data-home] .solution-card', '[data-home] .news-card',
    '[data-home] .process', '[data-home] .stat', '[data-home] .contact-information',
  ].join(','))).filter(root => !root.closest('header, dialog, form, .mobile-banner') && !root.querySelector('h1'));
  const roots = candidates.filter(root => !candidates.some(other => other !== root && other.contains(root)));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  roots.forEach(root => root.dataset.contentRevealRoot = '');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const preset = getComputedStyle(document.documentElement);
  const duration = parseFloat(preset.getPropertyValue('--content-reveal-duration')) || 1300;
  const stagger = parseFloat(preset.getPropertyValue('--content-reveal-stagger')) || 200;
  const entryDelay = parseFloat(preset.getPropertyValue('--content-reveal-delay')) || 180;
  const owners = new Map<Element, HTMLElement>();
  const paints = new Map<HTMLElement, HTMLElement[]>();
  const groups = new Map<HTMLElement, object | string>();
  const starts = new Map<object | string, number>();
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  const isLine = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return element.matches('.solution-vertical, .news-vertical') ||
      (!element.textContent?.trim() && rect.width > 0 && rect.height > 0 && Math.min(rect.width, rect.height) < 3);
  };
  const boxes = (element: HTMLElement): HTMLElement[] => {
    if (isLine(element)) return [];
    if (getComputedStyle(element).display === 'contents') return Array.from(element.children).flatMap(child => boxes(child as HTMLElement));
    return [element];
  };
  const finish = (root: HTMLElement) => {
    clearTimeout(timers.get(root)); timers.delete(root);
    root.dataset.contentRevealState = 'complete';
    paints.get(root)?.forEach(paint => {
      paint.dataset.revealPaintState = 'complete';
      paint.style.removeProperty('--reveal-delay');
    });
  };
  const position = (root: HTMLElement) => {
    const rects = (paints.get(root) ?? [root]).map(paint => paint.getBoundingClientRect()).filter(rect => rect.width && rect.height);
    return { top: Math.min(...rects.map(rect => rect.top)), left: Math.min(...rects.map(rect => rect.left)) };
  };
  const observer = new IntersectionObserver(entries => {
    const ready = [...new Set(entries.filter(entry => entry.isIntersecting).map(entry => owners.get(entry.target)!))];
    ready.sort((a, b) => { const x = position(a), y = position(b); return Math.abs(x.top - y.top) < 24 ? x.left - y.left : x.top - y.top; });
    ready.forEach(root => {
      if (root.dataset.contentRevealState !== 'pending') return;
      const targets = paints.get(root)!;
      targets.forEach(target => observer.unobserve(target));
      const now = performance.now(), group = groups.get(root)!;
      const sequence = Math.max(0, (starts.get(group) ?? -Infinity) + stagger - now);
      const delay = entryDelay + sequence + (root.dataset.revealKind === 'copy' ? 180 : 0);
      starts.set(group, now + sequence);
      root.dataset.contentRevealState = 'revealing';
      targets.forEach(target => { target.style.setProperty('--reveal-delay', `${delay}ms`); target.dataset.revealPaintState = 'revealing'; });
      timers.set(root, setTimeout(() => finish(root), duration + delay + 300));
    });
  }, { rootMargin: '0px 0px -18% 0px', threshold: .08 });

  roots.forEach(root => {
    const contentOnly = root.matches('.solution-card, .news-card, [data-application-card]');
    const targets = contentOnly ? Array.from(root.children).flatMap(child => boxes(child as HTMLElement)) : boxes(root);
    if (!targets.length) return;
    paints.set(root, targets);
    groups.set(root, root.dataset.revealGroup || root.parentElement || root);
    root.dataset.contentRevealState = 'pending';
    targets.forEach(target => {
      const style = getComputedStyle(target);
      target.style.setProperty('--reveal-transform', style.transform === 'none' ? 'matrix(1,0,0,1,0,0)' : style.transform);
      target.style.setProperty('--reveal-opacity', style.opacity);
      target.dataset.revealPaintState = 'pending';
      owners.set(target, root);
      observer.observe(target);
    });
    root.addEventListener('animationend', event => { if (event.animationName === 'content-reveal-in') finish(root); });
    root.addEventListener('focusin', () => { targets.forEach(target => observer.unobserve(target)); finish(root); });
  });
  const finishAll = () => { observer.disconnect(); roots.forEach(finish); };
  // Fast scrolling can pass a short or clipped visual between observer frames.
  // Keep it visible on the return journey instead of leaving it permanently hidden.
  let scrollFrame = false;
  addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = true;
    requestAnimationFrame(() => {
      scrollFrame = false;
      roots.forEach(root => {
        if (root.dataset.contentRevealState !== 'pending') return;
        const targets = paints.get(root) ?? [];
        const rects = targets.map(target => target.getBoundingClientRect()).filter(rect => rect.width && rect.height);
        if (rects.length && rects.every(rect => rect.bottom < 0)) {
          targets.forEach(target => observer.unobserve(target));
          finish(root);
        }
      });
    });
  }, { passive: true });
  motion.addEventListener('change', () => { if (motion.matches) finishAll(); });
  addEventListener('beforeprint', finishAll);
}
